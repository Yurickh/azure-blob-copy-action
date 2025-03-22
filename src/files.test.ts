import path from "path"
import { walkFiles } from "./files"

test("walkFiles", async () => {
  const files: string[] = []
  await walkFiles(".", (path) => {
    files.push(path)

    return Promise.resolve()
  })

  expect(files).toContain("package.json")
  expect(files).toContain(path.join("dist", "index.js"))
})
