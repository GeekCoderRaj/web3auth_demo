import { useEffect, useState } from "react";
import { Web3Auth } from "@web3auth/web3auth";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import { CHAIN_NAMESPACES, SafeEventEmitterProvider ,ADAPTER_EVENTS } from "@web3auth/base";
import { getPublicCompressed } from "@toruslabs/eccrypto";
import RPC from "./evm";

const clientId = "BEGFvpvWM4Y2jxY7xkZWlrz7btsR4oLgdSmFLle8eijI-ma3izWyR-Nmu7lNcvjSpnPGETGMzoor9cz0NOe1nE0"; 

function App() {
  const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);
  const [provider, setProvider] = useState<SafeEventEmitterProvider | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
      const web3auth = new Web3Auth({
        clientId,
        chainConfig: {
          chainNamespace: CHAIN_NAMESPACES.EIP155,
          chainId: "0x13881",
          rpcTarget: "https://polygon-mumbai.g.alchemy.com/v2/HXppMyS9DXP6baHkWcIZ5vs3B9FaMpbv" 
        }
      });
      const openloginAdapter = new OpenloginAdapter({
        adapterSettings: {
          network: "testnet",
          clientId,
          uxMode: "popup"
        },
        chainConfig:{
          chainNamespace: CHAIN_NAMESPACES.EIP155,
          chainId: "0x13881",
          rpcTarget: "https://polygon-mumbai.g.alchemy.com/v2/HXppMyS9DXP6baHkWcIZ5vs3B9FaMpbv" ,
          blockExplorer: "https://mumbai.polygonscan.com/",
          displayName: "Matic",
          ticker: "MATIC",
          tickerName: "MATIC Token",
        },
      })
      web3auth.configureAdapter(openloginAdapter);
      await web3auth.initModal();
          setWeb3auth(web3auth);
      
      
        } catch (error) {
          console.error(error);
        }
      };

      init();
  }, []);
  const login = async () => {
    if (!web3auth) {
      console.log("web3auth not initialized yet");
      return;
    }
    await web3auth.connect();
    setProvider(web3auth.provider);
    console.log(web3auth.provider);
    getprivatekey();
    
  };
  const getprivatekey = async() =>{
    const privatekey = await web3auth?.provider?.request({
      method: "eth_private_key"
    })
    console.log(privatekey)
    const app_scoped_privkey = privatekey;
    const app_pub_key = getPublicCompressed(Buffer.from(app_scoped_privkey.padStart(64, "0"), "hex")).toString("hex");
    console.log(app_pub_key);
  }
  // const getPrivateKey = async() => {
    //   try{

  //     const privateKey = await web3auth.provider.request({
  //         method: "private_key"
  //     });
  //     console.log(privateKey);
  //   }catch(e){
  //     console.log(e)
  //   }
  // };
  const getUserInfo = async () => {
    if (!web3auth) {
      console.log("web3auth not initialized yet");
      return;
    }
    const user = await web3auth.getUserInfo();
    console.log(user);
    getprivatekey();
  };

  const logout = async () => {
    if (!web3auth) {
      console.log("web3auth not initialized yet");
      return;
    }
    await web3auth.logout();
    setProvider(null);
  };

  const getAccounts = async () => {
    if (!provider) {
      console.log("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const userAccount = await rpc.getAccounts();
    console.log(userAccount);
  };

  const getBalance = async () => {
    if (!provider) {
      console.log("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const balance = await rpc.getBalance();
    console.log(balance);
  };
  const loggedInView = (
    <>
      <button onClick={getUserInfo} className="card">
        Get User Info
      </button>
      <button onClick={getAccounts} className="card">
        Get Accounts
      </button>
      <button onClick={getBalance} className="card">
        Get Balance
      </button>
      <button onClick={logout} className="card">
        Log Out
      </button>
      {/* <button onClick={getPrivateKey} className="card">
        Privatekey
      </button> */}

      <div id="console" style={{ whiteSpace: "pre-line" }}>
        <p style={{ whiteSpace: "pre-line" }}></p>
      </div>
    </>
  );

  const unloggedInView = (
    <button onClick={login} className="card">
      Login
    </button>
  );

  return (
    <div className="container">

      <div className="grid">{provider ? loggedInView : unloggedInView}</div>

     
    </div>
  );
}

export default App;