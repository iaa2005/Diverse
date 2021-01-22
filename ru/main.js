const Web3Modal = window.Web3Modal.default;
const Web3 = window.Web3;
const WalletConnectProvider = window.WalletConnectProvider;
const evmChains = window.evmChains;

let web3Modal;
let provider;
let selectedAccount;

let menuaddr = document.getElementById("menu-address");
menuaddr.classList.add("remove");

function init() {
    // Check that the web page is run in a secure context,
    // as otherwise MetaMask won't be available
    // if(location.protocol !== 'https:') {
    //
    //     return;
    // }

    const providerOptions = {
        metamask: {
            id: "injected",
            name: "MetaMask",
            type: "injected",
            check: "isMetaMask"
        },
        walletconnect: {
            package: WalletConnectProvider, // required
            options: {
                infuraId: "",
                qrcodeModalOptions: {
                    mobileLinks: [
                        "rainbow",
                        "metamask",
                        "argent",
                        "trust",
                        "imtoken",
                        "pillar"
                    ]
                }
            }
        }
    };

    web3Modal = new Web3Modal({
        theme: "light",
        network: "mainnet",
        cacheProvider: true,
        providerOptions
    });
}

/**
 * Kick in the UI action after Web3modal dialog has chosen a provider
 */
async function fetchAccountData() {
    const web3 = new Web3(provider);

    let accounts = await web3.eth.getAccounts();
    selectedAccount = accounts[0];
    console.log(selectedAccount);
}

/**
 * Fetch account data for UI when
 * - User switches accounts in wallet
 * - User switches networks in wallet
 * - User connects wallet initially
 */
async function refreshAccountData() {

    // If any current data is displayed when
    // the user is switching acounts in the wallet
    // immediate hide this data

    // document.querySelector("#connected").style.display = "none";
    // document.querySelector("#prepare").style.display = "block";

    // Disable button while UI is loading.
    // fetchAccountData() will take a while as it communicates
    // with Ethereum node via JSON-RPC and loads chain data
    // over an API call.

    // document.querySelector("#btn-connect").setAttribute("disabled", "disabled")
    await fetchAccountData(provider);
    // document.querySelector("#btn-connect").removeAttribute("disabled")
}

/**
 * Connect wallet button pressed.
 */
async function onConnect() {
    try {
        provider = await web3Modal.connect();
    } catch(e) {
        console.log("Could not get a wallet connection", e);
    }

    // Subscribe to accounts change
    provider.on("accountsChanged", (accounts) => {
        fetchAccountData();
    });

    // Subscribe to chainId change
    provider.on("chainChanged", (chainId) => {
        fetchAccountData();
    });

    // Subscribe to networkId change
    provider.on("networkChanged", (networkId) => {
        fetchAccountData();
    });

    await refreshAccountData();
}

/**
 * Disconnect wallet button pressed.
 */
async function onDisconnect() {

    console.log("Killing the wallet connection", provider);

    // TODO: Which providers have close method?
    if(provider.close) {
        await provider.close();

        // If the cached provider is not cleared,
        // WalletConnect will default to the existing session
        // and does not allow to re-scan the QR code with a new wallet.
        // Depending on your use case you may want or want not his behavior.
        await web3Modal.clearCachedProvider();
        provider = null;
    }

    selectedAccount = null;

    // Set the UI back to the initial state

    // document.querySelector("#prepare").style.display = "block";
    // document.querySelector("#connected").style.display = "none";
}



/**
 * Main entry point.
 */
window.addEventListener('load', async () => {
    init();
    let buttonConnect = document.getElementById("connect-btn")
    buttonConnect.addEventListener("click", onConnect)
    // document.querySelector("#btn-disconnect").addEventListener("click", onDisconnect);
});
