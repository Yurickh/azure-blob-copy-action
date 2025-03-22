import { CopyParameters } from './copy'

describe('CopyParameters', () => {
  it('requires action', () => {
    expect(() => {
      new CopyParameters('xxx', 'd', 'c', undefined, 'd')
    }).toThrow(
      "The action input is required and must be 'upload' or 'download'.",
    )
  })

  it('requires connection_string', () => {
    expect(() => {
      new CopyParameters('upload', '', 'c', undefined, 'd')
    }).toThrow('The connection_string input is required.')
  })

  it('requires container_name', () => {
    expect(() => {
      new CopyParameters('upload', 'd', '', undefined, 'd')
    }).toThrow('The container_name input is required.')
  })

  it('requires local_directory', () => {
    expect(() => {
      new CopyParameters('upload', 'x', 'x', undefined, '')
    }).toThrow('The local_directory input is required.')
  })
})
