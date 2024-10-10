import { useEffect } from 'react'
import './App.css'
import useWebSocket from 'react-use-websocket'

interface storedFile {
  rawData: ArrayBuffer,
  type: string
}

function App() {
  const url = 'ws://localhost:6969/start_web_socket'
  const { sendMessage, lastMessage } = useWebSocket(url);

  useEffect(() => {
    if (lastMessage !== null) {
      console.log(lastMessage)
      const retrievedFile = JSON.parse(lastMessage.data)
      
      // Make sure rawData is converted back to a Uint8Array
      const file: storedFile = {
        rawData: new Uint8Array(retrievedFile.data).buffer, // convert back to ArrayBuffer
        type: retrievedFile.type
      }
      
      console.log(file)
      download(file)
    }
  }, [lastMessage])

  function download(file: storedFile) {
    console.log(`Downloading file: ${file.type}`)
    
    // Convert array back into Uint8Array
    const uint8Array = new Uint8Array(file.rawData)
    const blob = new Blob([uint8Array], { type: file.type })
    
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = file.type
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
  

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const files = e.target.files ? Array.from(e.target.files) : []
    if (files.length === 0) return
    const file = files[0]
    console.log("sending file:", file)
  
    const reader = new FileReader()
    reader.onload = () => {
      const arrayBuffer = reader.result as ArrayBuffer
      const message = {
        type: file.type,
        data: Array.from(new Uint8Array(arrayBuffer))
      }
      
      sendMessage(JSON.stringify(message))
    }
  
    reader.readAsArrayBuffer(file)
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