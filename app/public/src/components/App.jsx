import { useState, useEffect } from 'react'
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js'
import { Program, Provider, web3 } from '@project-serum/anchor'
import idl from '../idl/coffee_stylus.json'

import './App.css'

const { SystemProgram, Keypair } = web3
const programID = new PublicKey(idl.metadata.address)

function App() {
  const [walletAddress, setWalletAddress] = useState(null)
  const [coffees, setCoffees] = useState([])
  const [newCoffee, setNewCoffee] = useState({
    name: '',
    origin: '',
    price: '',
    roastLevel: ''
  })

  const checkIfWalletIsConnected = async () => {
    try {
      const { solana } = window
      if (solana && solana.isPhantom) {
        const response = await solana.connect({ onlyIfTrusted: true })
        setWalletAddress(response.publicKey.toString())
      }
    } catch (error) {
      console.error(error)
    }
  }

  const connectWallet = async () => {
    const { solana } = window
    if (solana) {
      const response = await solana.connect()
      setWalletAddress(response.publicKey.toString())
    }
  }

  const getProvider = () => {
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed')
    const provider = new Provider(
      connection,
      window.solana,
      { commitment: 'confirmed' }
    )
    return provider
  }

  const getProgram = async () => {
    const provider = getProvider()
    const program = new Program(idl, programID, provider)
    return program
  }

  const createCoffee = async () => {
    try {
      const program = await getProgram()
      const coffeeKey = Keypair.generate()
      
      await program.rpc.initialize(
        newCoffee.name,
        newCoffee.origin,
        parseInt(newCoffee.price),
        parseInt(newCoffee.roastLevel),
        {
          accounts: {
            coffeeAccount: coffeeKey.publicKey,
            user: provider.wallet.publicKey,
            systemProgram: SystemProgram.programId,
          },
          signers: [coffeeKey]
        }
      )

      alert('Coffee created successfully!')
      fetchCoffees()
    } catch (error) {
      console.error('Error creating coffee:', error)
      alert('Error creating coffee')
    }
  }

  const buyCoffee = async (coffeePubKey) => {
    try {
      const program = await getProgram()
      
      await program.rpc.buyCoffee({
        accounts: {
          coffeeAccount: coffeePubKey,
          buyer: provider.wallet.publicKey,
        }
      })

      alert('Coffee purchased successfully!')
      fetchCoffees()
    } catch (error) {
      console.error('Error buying coffee:', error)
      alert('Error buying coffee')
    }
  }

  const fetchCoffees = async () => {
    // In a real app, you would fetch all coffee accounts
    // This is simplified for demonstration
    const program = await getProgram()
    // Implementation would depend on your account structure
  }

  useEffect(() => {
    const onLoad = async () => {
      await checkIfWalletIsConnected()
    }
    window.addEventListener('load', onLoad)
    return () => window.removeEventListener('load', onLoad)
  }, [])

  return (
    <div className="App">
      <header>
        <h1>Coffee-Stylus (Solana)</h1>
        {!walletAddress && (
          <button onClick={connectWallet}>Connect Wallet</button>
        )}
        {walletAddress && <p>Wallet: {walletAddress}</p>}
      </header>

      <main>
        <section className="coffee-form">
          <h2>Add New Coffee</h2>
          <input
            type="text"
            placeholder="Name"
            value={newCoffee.name}
            onChange={(e) => setNewCoffee({...newCoffee, name: e.target.value})}
          />
          <input
            type="text"
            placeholder="Origin"
            value={newCoffee.origin}
            onChange={(e) => setNewCoffee({...newCoffee, origin: e.target.value})}
          />
          <input
            type="number"
            placeholder="Price (lamports)"
            value={newCoffee.price}
            onChange={(e) => setNewCoffee({...newCoffee, price: e.target.value})}
          />
          <input
            type="number"
            placeholder="Roast Level (1-5)"
            min="1"
            max="5"
            value={newCoffee.roastLevel}
            onChange={(e) => setNewCoffee({...newCoffee, roastLevel: e.target.value})}
          />
          <button onClick={createCoffee}>Create Coffee</button>
        </section>

        <section className="coffee-list">
          <h2>Available Coffees</h2>
          {coffees.length > 0 ? (
            <div className="coffee-grid">
              {coffees.map((coffee) => (
                <div key={coffee.publicKey} className="coffee-card">
                  <h3>{coffee.account.name}</h3>
                  <p>Origin: {coffee.account.origin}</p>
                  <p>Price: {coffee.account.price} lamports</p>
                  <p>Roast: {coffee.account.roastLevel}/5</p>
                  <button 
                    onClick={() => buyCoffee(coffee.publicKey)}
                    disabled={!coffee.account.available}
                  >
                    {coffee.account.available ? 'Buy' : 'Sold Out'}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p>No coffees available</p>
          )}
        </section>
      </main>
    </div>
  )
}

export default App
