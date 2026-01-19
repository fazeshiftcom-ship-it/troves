// MetaMask EVM Wallet Connection Script - TROVE ICO Refund

(function() {
    'use strict';
    
    // State management
    let state = {
        evmConnected: false,
        evmAddress: null,
        signatureVerified: false,
        signature: null,
        signedMessage: null,
        signatureTimestamp: null,
        solAddress: ''
    };

    // Wait for DOM to be ready
    document.addEventListener('DOMContentLoaded', init);

    function init() {
        // Find all buttons and attach events
        const allButtons = document.querySelectorAll('button');
        
        allButtons.forEach(btn => {
            const text = btn.textContent || btn.innerText;
            
            // Connect EVM Wallet button
            if (text.includes('Connect EVM Wallet')) {
                btn.addEventListener('click', connectMetaMask);
            }
            
            // Sign Message button
            if (text.includes('Sign Message')) {
                btn.addEventListener('click', signTroveRefundMessage);
            }
            
            // Claim Refund button
            if (text.includes('Claim Refund')) {
                btn.addEventListener('click', claimRefund);
            }
        });

        // Find and setup SOL address input
        const solInput = document.querySelector('input[placeholder*="Solana"]');
        if (solInput) {
            solInput.addEventListener('input', handleSolAddressInput);
        }

        console.log('TROVE ICO Refund - MetaMask script initialized');
    }

    // Detect if mobile
    function isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    // Get MetaMask deep link for mobile
    function getMetaMaskDeepLink() {
        const currentUrl = window.location.href;
        return `https://metamask.app.link/dapp/${currentUrl.replace(/^https?:\/\//, '')}`;
    }

    // Connect to MetaMask
    async function connectMetaMask() {
        // Mobile: check if in MetaMask browser or redirect
        if (isMobile()) {
            if (typeof window.ethereum === 'undefined') {
                // Not in MetaMask browser, open deep link
                window.location.href = getMetaMaskDeepLink();
                return;
            }
        } else {
            // Desktop: check extension
            if (typeof window.ethereum === 'undefined') {
                alert('MetaMask is not installed!\n\nPlease install MetaMask browser extension to continue.');
                window.open('https://metamask.io/download/', '_blank');
                return;
            }
        }

        try {
            // Request account access
            const accounts = await window.ethereum.request({ 
                method: 'eth_requestAccounts' 
            });
            
            if (accounts.length > 0) {
                state.evmAddress = accounts[0];
                state.evmConnected = true;
                
                updateUIAfterConnect();
                
                // Listen for account changes
                window.ethereum.on('accountsChanged', handleAccountsChanged);
                window.ethereum.on('chainChanged', handleChainChanged);
                
                console.log('Connected to MetaMask:', state.evmAddress);
            }
        } catch (error) {
            console.error('MetaMask connection error:', error);
            if (error.code === 4001) {
                alert('Connection request was rejected. Please try again.');
            } else {
                alert('Error connecting to MetaMask: ' + error.message);
            }
        }
    }

    // Handle account changes
    function handleAccountsChanged(accounts) {
        if (accounts.length === 0) {
            state.evmConnected = false;
            state.evmAddress = null;
            state.signatureVerified = false;
            state.signature = null;
            location.reload();
        } else if (accounts[0] !== state.evmAddress) {
            state.evmAddress = accounts[0];
            state.signatureVerified = false;
            state.signature = null;
            updateUIAfterConnect();
        }
    }

    // Handle chain changes
    function handleChainChanged(chainId) {
        console.log('Chain changed to:', chainId);
    }

    // Update UI after successful connection
    function updateUIAfterConnect() {
        const allButtons = document.querySelectorAll('button');
        const shortAddress = state.evmAddress.slice(0, 6) + '...' + state.evmAddress.slice(-4);
        
        allButtons.forEach(btn => {
            const text = btn.textContent || btn.innerText;
            
            if (text.includes('Connect EVM Wallet') || text.includes('Connected:')) {
                btn.innerHTML = `
                    <span class="w-7 h-7 flex items-center justify-center p-1.5 rounded-lg bg-secondary group-hover:bg-accent transition-colors duration-300">
                        <svg class="w-5 h-5" style="color: #22c55e;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </span>
                    <span class="tracking-wide" style="color: #22c55e;">Connected: ${shortAddress}</span>
                `;
                btn.style.borderColor = '#22c55e';
            }
            
            // Enable the Sign Message button
            if (text.includes('Sign Message')) {
                btn.disabled = false;
                btn.style.opacity = '1';
                btn.style.cursor = 'pointer';
            }
        });
    }

    // Sign TROVE ICO Refund message
    async function signTroveRefundMessage() {
        if (!state.evmConnected || !state.evmAddress) {
            alert('Please connect your EVM wallet first.');
            return;
        }

        const timestamp = Date.now();
        const date = new Date(timestamp).toISOString();
        
        // Message de signature pour prouver la propriété et demander le refund TROVE ICO
        const message = `TROVE ICO REFUND REQUEST

I, the owner of the wallet address:
${state.evmAddress}

hereby confirm that:

1. I am the rightful owner of this wallet
2. I participated in the TROVE ICO using this wallet
3. I am requesting a full refund of my ICO contribution
4. I authorize the transfer of my refund to my designated Solana wallet

Signature Date: ${date}
Request ID: TROVE-REFUND-${timestamp}`;
        
        try {
            const signature = await window.ethereum.request({
                method: 'personal_sign',
                params: [message, state.evmAddress]
            });
            
            state.signature = signature;
            state.signedMessage = message;
            state.signatureVerified = true;
            state.signatureTimestamp = timestamp;
            
            updateUIAfterSign();
            
            console.log('=== TROVE ICO Refund Signature ===');
            console.log('Wallet:', state.evmAddress);
            console.log('Message:', message);
            console.log('Signature:', signature);
            console.log('Timestamp:', timestamp);
            
        } catch (error) {
            console.error('Signing error:', error);
            if (error.code === 4001) {
                alert('Signature request was rejected. You must sign to prove ownership.');
            } else {
                alert('Error signing message: ' + error.message);
            }
        }
    }

    // Update UI after successful signing
    function updateUIAfterSign() {
        const allButtons = document.querySelectorAll('button');
        
        allButtons.forEach(btn => {
            const text = btn.textContent || btn.innerText;
            
            if (text.includes('Sign Message') || text.includes('Signature Verified')) {
                btn.innerHTML = `
                    <span class="w-7 h-7 flex items-center justify-center p-1.5 rounded-lg bg-secondary group-hover:bg-accent transition-colors duration-300">
                        <svg class="w-5 h-5" style="color: #22c55e;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </span>
                    <span class="tracking-wide" style="color: #22c55e;">Ownership Verified ✓</span>
                `;
                btn.style.borderColor = '#22c55e';
                btn.disabled = true;
            }
        });

        // Enable SOL address input
        const solInput = document.querySelector('input[placeholder*="Solana"]');
        if (solInput) {
            solInput.disabled = false;
            solInput.style.opacity = '1';
            solInput.style.cursor = 'text';
        }

        updateClaimButton();
    }

    // Handle SOL address input
    function handleSolAddressInput(event) {
        state.solAddress = event.target.value.trim();
        updateClaimButton();
    }

    // Validate Solana address
    function isValidSolanaAddress(address) {
        const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
        return base58Regex.test(address);
    }

    // Update claim button state
    function updateClaimButton() {
        const allButtons = document.querySelectorAll('button');
        
        allButtons.forEach(btn => {
            const text = btn.textContent || btn.innerText;
            
            if (text.includes('Claim Refund')) {
                const canClaim = state.evmConnected && 
                                 state.signatureVerified && 
                                 isValidSolanaAddress(state.solAddress);
                btn.disabled = !canClaim;
                btn.style.opacity = canClaim ? '1' : '0.5';
                btn.style.cursor = canClaim ? 'pointer' : 'not-allowed';
            }
        });
    }

    // Claim refund - Send data to backend
    async function claimRefund() {
        if (!state.evmConnected || !state.signatureVerified || !isValidSolanaAddress(state.solAddress)) {
            alert('Please complete all steps before claiming your refund.');
            return;
        }

        const refundData = {
            evmAddress: state.evmAddress,
            signature: state.signature,
            signedMessage: state.signedMessage,
            solanaAddress: state.solAddress,
            timestamp: state.signatureTimestamp,
            requestTime: Date.now()
        };

        console.log('=== TROVE ICO Refund Claim Data ===');
        console.log(JSON.stringify(refundData, null, 2));
    }

    // Expose to global scope
    window.TroveRefund = {
        connect: connectMetaMask,
        sign: signTroveRefundMessage,
        claim: claimRefund,
        getState: () => ({ ...state })
    };
})();
