import React from 'react'
import CustomizedCodeEditor from '../atoms/CustomizedCodeEditor'
import CustomizedMarkdownPreviewer from '../atoms/CustomizedMarkdownPreviewer'
import { mdiEyeOutline, mdiArrowSplitVertical } from '@mdi/js'
import ToolbarIconButton from '../atoms/ToolbarIconButton'
import Toolbar from '../atoms/Toolbar'
import ToolbarSeparator from '../atoms/ToolbarSeparator'
import { TutorialsNavigatorTreeItem } from '../../lib/tutorials'
import { StyledNoteDetailContainer } from '../NotePage/NoteDetail/NoteDetail'

type TutorialsNoteDetailProps = {
  note: TutorialsNavigatorTreeItem
  splitMode: boolean
  previewMode: boolean
  toggleSplitMode: () => void
  togglePreviewMode: () => void
}

type TutorialsNoteDetailState = {
  noteComponent: string
  noteContent: string
}

export default class TutorialsNoteDetail extends React.Component<
  TutorialsNoteDetailProps
> {
  state: TutorialsNoteDetailState = {
    noteComponent: this.props.note.slug,
    noteContent: ''
  }

  async componentDidMount() {
    this.setState({ noteContent: await this.fetchNoteContentFromTreeItem() })
  }

  async fetchNoteContentFromTreeItem() {
    try {
      const doc = await import(
        `../../lib/tutorials/files${this.props.note.absolutePath}`
      )
      return doc.default
    } catch (error) {
      console.log(error)
      return `Could not load the file`
    }
  }

  async componentDidUpdate(
    _prevProps: TutorialsNoteDetailProps,
    prevState: TutorialsNoteDetailState
  ) {
    const { note } = this.props
    if (note.absolutePath !== prevState.noteComponent) {
      this.setState({
        noteComponent: note.absolutePath,
        noteContent: await this.fetchNoteContentFromTreeItem()
      })
    }
  }

  codeMirror?: CodeMirror.EditorFromTextArea
  codeMirrorRef = (codeMirror: CodeMirror.EditorFromTextArea) => {
    this.codeMirror = codeMirror
  }

  render() {
    const {
      note,
      splitMode,
      previewMode,
      toggleSplitMode,
      togglePreviewMode
    } = this.props

    const codeEditor = (
      <CustomizedCodeEditor
        className='editor'
        key={note.slug}
        codeMirrorRef={this.codeMirrorRef}
        value={this.state.noteContent}
        onChange={() => {}}
        readonly={true}
      />
    )
    const markdownPreviewer = (
      <CustomizedMarkdownPreviewer content={this.state.noteContent} />
    )

    return (
      <StyledNoteDetailContainer>
        {note == null ? (
          <p>No note is selected</p>
        ) : (
          <>
            <div className='titleSection'>
              <input value={this.props.note.label} disabled={true} />
            </div>
            <div className='contentSection'>
              {previewMode ? (
                markdownPreviewer
              ) : splitMode ? (
                <>
                  <div className='splitLeft'>{codeEditor}</div>
                  <div className='splitRight'>{markdownPreviewer}</div>
                </>
              ) : (
                codeEditor
              )}
            </div>
            <Toolbar>
              <ToolbarSeparator />
              <ToolbarIconButton
                className={splitMode ? 'active' : ''}
                onClick={toggleSplitMode}
                path={mdiArrowSplitVertical}
              />
              <ToolbarIconButton
                className={previewMode ? 'active' : ''}
                onClick={togglePreviewMode}
                path={mdiEyeOutline}
              />
            </Toolbar>
          </>
        )}
      </StyledNoteDetailContainer>
    )
  }
}
