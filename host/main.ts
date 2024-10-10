import { Application, Router } from "https://deno.land/x/oak/mod.ts"

const app: Application = new Application()
const port: number = 6969
const router: Router = new Router()

let currentlyStoredFile: Uint8Array | null = null
let currentlyStoredFileName: string | null = null

router.get("/start_web_socket", async (ctx) => {
    const socket = await ctx.upgrade()

    socket.onopen = () => {
        console.log("client socket opened!")
    }

    socket.onclose = () => {
        console.log("client socket closed!")
    }

    socket.onmessage = async (message: MessageEvent) => {
        const { file, filename } = JSON.parse(message.data)

        const response = JSON.stringify({
          file: currentlyStoredFile ? Array.from(currentlyStoredFile) : null,
          filename: currentlyStoredFileName
        })
        console.log("Response sent:", response)
        socket.send(response)

        console.log("Received file data:", { file, filename })

        // Ensure that the incoming file is valid
        if (file && Array.isArray(file)) {
            currentlyStoredFile = new Uint8Array(file)
            currentlyStoredFileName = filename
            console.log("Stored new file:", currentlyStoredFile);
        } else {
            console.log("No valid file data received.")
        }

        
    }
})

app.use(router.routes())
app.use(router.allowedMethods())

await app.listen({ port })
console.log(`Server is running at http://localhost:${port}`)
