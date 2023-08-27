
export const erc20 = (name,symbol,premint,features,license) => {
    const config ={
        TokenName: name , 
        Symbol : symbol,
        Premint : premint,
        Features :features,
        License : license
    }   
        const baseCode = `
        // SPDX-License-Identifier: ${config.License}
        pragma solidity ^0.8.9;
    
        import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
        ${config.Features.pausable ? 'import "@openzeppelin/contracts/security/Pausable.sol";':''}
       
        ${config.Features.mintable || config.Features.pausable || config.Features.snapshots? 'import "@openzeppelin/contracts/access/Ownable.sol";':''}
       
        ${config.Features.burnable ? 'import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";':''}
    
        ${config.Features.permit  || config.Features.votes  ? 'import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";':''}
        
        ${config.Features.votes ? 'import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";':''}
        
        ${config.Features.flashMinting ? 'import "@openzeppelin/contracts/token/ERC20/extensions/ERC20FlashMint.sol";' :''}
        
        ${config.Features.snapshots ? 'import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Snapshot.sol";' : ''}
    
        contract ${config.TokenName} is ERC20${config.Features.snapshots ? ',ERC20Snapshot':''}${config.Features.flashMinting?',ERC20FlashMint':''}${config.Features.burnable ? ',ERC20Burnable':''}${config.Features.mintable || config.Features.pausable || config.Features.snapshots ? ',Ownable':''}${config.Features.pausable ? ',Pausable' :''}${config.Features.permit || config.Features.votes ?',ERC20Permit':''}${config.Features.votes ? ', ERC20Votes':''}{
            constructor() ERC20("${config.TokenName}", "${config.Symbol}") ${config.Features.permit || config.Features.votes ?'ERC20Permit("'+config.TokenName+'")':''} {
                ${config.Premint > 0 ? '_mint(msg.sender, '+config.Premint+' * 10 ** decimals());':''}
            }
    
        ${config.Features.mintable ? 
        `function mint(address to, uint256 amount) public onlyOwner {
            _mint(to, amount);
          }` : ''}
        ${config.Features.pausable ? 
        `
        function pause() public onlyOwner {
            _pause();
        }
    
        function unpause() public onlyOwner {
            _unpause();
        }
        ` :''}
        ${config.Features.pausable && !config.Features.snapshots ?
            `
        function _beforeTokenTransfer(address from, address to, uint256 amount)
            internal
            whenNotPaused
            override
        {
         super._beforeTokenTransfer(from, to, amount);
        }
        `
            :''}
        ${config.Features.votes ?
       `
       function _afterTokenTransfer(address from, address to, uint256 amount)
            internal
            override(ERC20, ERC20Votes)
       {
         super._afterTokenTransfer(from, to, amount);
       }
    
       function _mint(address to, uint256 amount)
            internal
            override(ERC20, ERC20Votes)
       {
         super._mint(to, amount);
       }
    
       function _burn(address account, uint256 amount)
           internal
           override(ERC20, ERC20Votes)
       {
       super._burn(account, amount);
       }
       `:''}    
       ${config.Features.snapshots ? 
        `
       function snapshot() public onlyOwner {
            _snapshot();
       }
    
        // The following functions are overrides required by Solidity.
    
       function _beforeTokenTransfer(address from, address to, uint256 amount)
            internal
            override(ERC20, ERC20Snapshot)
       {
           super._beforeTokenTransfer(from, to, amount);
       }
        `
        :''}
      }
        `
        return baseCode
    
}