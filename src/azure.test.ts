import * as fs from 'fs'
import path from 'path'
import { AzureBlobStorage, AzureConnectionOptions } from './azure'
import { walkFiles } from './files'

afterAll(() => {
  if (!process.env.PRESERVE_TEST_ARTIFACTS) {
    fs.rmSync('temp_tests', { recursive: true })
  }
})

const connectionString = process.env.AZURE_CONNECTION_STRING

if (!connectionString) {
  throw new Error(
    'Failed to read process.env.AZURE_CONNECTION_STRING. Please ensure env variables are properly configured',
  )
}
const connectOptions: AzureConnectionOptions = {
  connectionString,
  containerName: 'tests',
}

test('connection strings', async () => {
  await expect(
    AzureBlobStorage.create({ connectionString, containerName: 'xxx' }),
  ).rejects.toThrow()
  await expect(AzureBlobStorage.create(connectOptions)).resolves.toBeDefined()
})

test('upload download file', async () => {
  const azureBlobStorage = await AzureBlobStorage.create(connectOptions)

  const uploadDirectory = path.join('temp_tests', 'upload')
  const uploadFilePath = path.join(uploadDirectory, 'uploadFile.txt')

  const downloadDirectory = path.join('temp_tests', 'download')
  const downloadDirectory2 = path.join('temp_tests', 'download2')
  const downloadFilePath = path.join(downloadDirectory, 'uploadFile.txt')
  const downloadFilePath2 = path.join(downloadDirectory2, 'uploadFile.txt')

  if (fs.existsSync(downloadFilePath)) {
    fs.unlinkSync(downloadFilePath)
  }

  if (fs.existsSync(downloadFilePath2)) {
    fs.unlinkSync(downloadFilePath2)
  }

  fs.mkdirSync(uploadDirectory, { recursive: true })
  fs.writeFileSync(uploadFilePath, 'Allo', { encoding: 'utf8' })

  await azureBlobStorage.uploadFile(uploadFilePath, {
    localDirectory: uploadDirectory,
  })
  await azureBlobStorage.uploadFile(uploadFilePath, {
    localDirectory: uploadDirectory,
    blobDirectory: 'subdirectory',
  })

  await azureBlobStorage.downloadFile('uploadFile.txt', {
    localDirectory: downloadDirectory,
  })
  await azureBlobStorage.downloadFile('uploadFile.txt', {
    localDirectory: downloadDirectory2,
  })

  expect(fs.readFileSync(downloadFilePath, { encoding: 'utf8' })).toBe('Allo')
  expect(fs.readFileSync(downloadFilePath2, { encoding: 'utf8' })).toBe('Allo')
})

test('walkBlobs', async () => {
  const azureBlobStorage = await AzureBlobStorage.create(connectOptions)

  const count = [0]
  await azureBlobStorage.walkBlobs(async () => {
    ++count[0]
    return Promise.resolve()
  })

  expect(count[0]).toBeGreaterThan(0)
})

test('upload download files', async () => {
  const downloadedPath = path.join('temp_tests', 'downloaded')

  const azureBlobStorage = await AzureBlobStorage.create(connectOptions)

  const countUploaded = await azureBlobStorage.uploadFiles({
    localDirectory: 'temp_tests',
  })

  expect(countUploaded).toBeGreaterThan(0)

  const countDownloaded = await azureBlobStorage.downloadFiles({
    localDirectory: downloadedPath,
  })

  const i = [0]
  await walkFiles(downloadedPath, async () => {
    i[0] += 1
    return Promise.resolve()
  })

  expect(countDownloaded).toBe(i[0])
  expect(countDownloaded).toBeGreaterThanOrEqual(countUploaded)
})

test('computeDownloadDestFilePath', () => {
  expect(
    AzureBlobStorage.computeDownloadDestFilePath('folder1/folder2/myfile.txt', {
      localDirectory: '.',
    }),
  ).toBe(path.join('folder1', 'folder2', 'myfile.txt'))

  expect(
    AzureBlobStorage.computeDownloadDestFilePath('folder1/folder2/myfile.txt', {
      localDirectory: 'dist',
      blobDirectory: 'folder1',
    }),
  ).toBe(path.join('dist', 'folder2', 'myfile.txt'))

  expect(
    AzureBlobStorage.computeDownloadDestFilePath(
      '/folder1/folder2/myfile.txt',
      { localDirectory: 'dist', blobDirectory: '/folder1' },
    ),
  ).toBe(path.join('dist', 'folder2', 'myfile.txt'))

  expect(
    AzureBlobStorage.computeDownloadDestFilePath('folder1/folder2/myfile.txt', {
      localDirectory: 'dist',
      blobDirectory: '/folder1',
    }),
  ).toBe(path.join('dist', 'folder2', 'myfile.txt'))

  expect(
    AzureBlobStorage.computeDownloadDestFilePath(
      '/folder1/folder2/myfile.txt',
      { localDirectory: 'dist', blobDirectory: 'folder1' },
    ),
  ).toBe(path.join('dist', 'folder2', 'myfile.txt'))
})
