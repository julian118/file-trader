import { useEffect, useState } from 'react'
import './App.css'
import useWebSocket from 'react-use-websocket'

interface fileMessage {
  file: Uint8Array,
  filename: string
}
function App() {
  const url = 'ws://localhost:6969/start_web_socket'
  const { sendMessage, lastMessage, readyState } = useWebSocket(url);

  useEffect(() => {
    if (lastMessage !== null) {
      const messageData: fileMessage = JSON.parse(lastMessage.data)
      const file: Uint8Array = messageData.file
      const filename: string = messageData.filename
      download(file, filename)
    }
  }, [lastMessage]);

  function download(file: Uint8Array, filename: string) {
    console.log('Downloading blob...')
    const url  = URL.createObjectURL(new Blob([file]))
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }


  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const files = e.target.files ? Array.from(e.target.files) : []
    if (files.length > 0) {
        console.log("sending file:", files[0])
        const reader = new FileReader()
        reader.onload = () => {
            const arrayBuffer = reader.result as ArrayBuffer
            const file = new Uint8Array(arrayBuffer)
            const message: string = JSON.stringify({
                file: Array.from(file), // Convert to plain array
                filename: files[0].name
            })
            sendMessage(message)
        }
        reader.readAsArrayBuffer(files[0])
    }
  }


  return (
    <>
      <div>
        <div className='container'>
          <h1>file trader</h1>
          <input type="file" onChange={handleFileSelected} />
        </div>
      </div>
    </>
  )
}

export default App