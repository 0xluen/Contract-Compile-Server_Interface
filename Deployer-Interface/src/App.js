import { useEffect, useState } from 'react';
import './App.css';
import { erc20 } from './modules/erc20';
import axios from 'axios';
import { ethers } from 'ethers';

function App() {

  const connectMetamask = async () => {
    if (window.ethereum) {
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const address = await signer.getAddress();
        } catch (error) {
            console.error(error);
        }
    } else {
        alert("MetaMask not detected. Please install MetaMask extension.");
    }
};


  const [contract , setContract]=useState(
    `
    // SPDX-License-Identifier: MIT
     pragma solidity ^0.8.9;
     
     import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
     
     contract MyToken is ERC20 {
         constructor() ERC20("MyToken", "MTK") {}
     }
    `)


  const [TokenName , setTokenName]=useState("MyToken")
  const [Symbol , setSymbol]=useState("MYT")
  const [Premint , setPremint]=useState(0)
  const [mintable , setmintable]=useState(false)
  const [burnable , setburnable]=useState(false)
  const [pausable , setpausable]=useState(false)
  const [permit , setpermit]=useState(false)
  const [votes , setvotes]=useState(false)
  const [flashMinting , setflashMinting]=useState(false)
  const [snapshots , setsnapshots]=useState(false)
  const [License , setLicense]=useState("MIT")


  ///////////////////////ABI & ByteCode////////////////


  const [ABI , setABI]=useState(null)
  const [ByteCode , setByteCode]=useState(null)
   
  const compile =async ()=>{
    
    const res = await axios.get("https://compile.rapidrpc.com/compile?code="+btoa(contract))
    setABI(JSON.stringify(res.data.abi) || null) 
    setByteCode(res.data.bytecode || null)

  }

 async function deploy() {
    // Kullanıcının MetaMask hesabını kullanarak işlem yapabilmesi için izin iste
    await window.ethereum.enable();

    // Ethers.js ile Ethereum ağına bağlanma
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    // Akıllı sözleşme nesnesini oluşturma
    const contractFactory = new ethers.ContractFactory(ABI, ByteCode, signer);

    try {
        // Akıllı sözleşmeyi deploy etme
        const deployedContract = await contractFactory.deploy();
        console.log('Contract deployed at:', deployedContract.address);
    } catch (error) {
        console.error('Error deploying contract:', error);
    }
}


  ////////////////////////////////////////////////////
  const Features = {
    mintable : mintable , 
    burnable : burnable ,
    pausable : pausable ,
    permit : permit ,
    votes : votes ,
    flashMinting : flashMinting ,
    snapshots : snapshots 
   }

   useEffect(()=>{connectMetamask()},[])

   useEffect(()=>{
    getCode()
   },[
    TokenName,
    Symbol,
    Premint,
    mintable,
    burnable,
    pausable,
    permit,
    votes,
    flashMinting,
    snapshots,
    License
  ])

  const getCode = async ()=>{
   const code =  await erc20(TokenName , Symbol , Premint , Features   ,License)
   setContract(code)
  }

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;

    if (type === 'checkbox') {
      eval(`set${name}(${checked})`);
    } else {
      eval(`set${name}("${value}")`);
    }
  };

  return (
    <div className="App">

  

     <h2>Token Settings</h2>
      <form>
        <label>
          Token Name:
          <input type="text" name="TokenName" value={TokenName} onChange={handleInputChange} />
        </label>
        <br />
        <label>
          Symbol:
          <input type="text" name="Symbol" value={Symbol} onChange={handleInputChange} />
        </label>
        <br />
        <label>
          Premint:
          <input type="number" name="Premint" value={Premint} onChange={handleInputChange} />
        </label>
        <br />
        <label>
          Mintable:
          <input type="checkbox" name="mintable" checked={mintable} onChange={handleInputChange} />
        </label>
        <br />
        <label>
          Burnable:
          <input type="checkbox" name="burnable" checked={burnable} onChange={handleInputChange} />
        </label>
        <br />
        <label>
          Pausable:
          <input type="checkbox" name="pausable" checked={pausable} onChange={handleInputChange} />
        </label>
        <br />
        <label>
          Permit:
          <input type="checkbox" name="permit" checked={permit} onChange={handleInputChange} />
        </label>
        <br />
        <label>
          Votes:
          <input type="checkbox" name="votes" checked={votes} onChange={handleInputChange} />
        </label>
        <br />
        <label>
          Flash Minting:
          <input type="checkbox" name="flashMinting" checked={flashMinting} onChange={handleInputChange} />
        </label>
        <br />
        <label>
          Snapshots:
          <input type="checkbox" name="snapshots" checked={snapshots} onChange={handleInputChange} />
        </label>
        <br />
        <label>
          License:
          <input type="text" name="License" value={License} onChange={handleInputChange} />
        </label>
        <br />
        
      </form>
      
      <button onClick={compile}>Compile</button>
      {ABI != null && <button onClick={deploy}>Deploy</button>}
     <hr></hr>
     <textarea  readOnly value={contract.replace(/^\s*$(?:\r\n?|\n)/gm, '\n')} style={{width:"100%",height:"500px"}} disabled ></textarea>
     <hr></hr>

     <textarea  readOnly hidden={ByteCode == null} value={ByteCode != null ? ByteCode:''} style={{width:"100%",height:"500px"}} ></textarea>
     <hr></hr>
     <textarea  readOnly hidden={ABI == null} value={ABI != null ? ABI:''} style={{width:"100%",height:"500px"}} ></textarea>

    </div>
  );
}

export default App;
