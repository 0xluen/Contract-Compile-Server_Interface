const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.get('/compile', (req, res) => {
    const contractCodeBase64 = req.query.code;
    if (!contractCodeBase64) {
      res.status(400).json({ error: 'Contract code not provided' });
      return;
    }
  
    const contractCode = Buffer.from(contractCodeBase64, 'base64').toString('utf-8');
    
    const contractNameMatch = contractCode.match(/contract\s+(\w+)\s+/);
    if (!contractNameMatch || !contractNameMatch[1]) {
      res.status(500).json({ error: 'Contract name not found in the code' });
      return;
    }
  
    const contractName = contractNameMatch[1];
    const randomFilename = Math.random().toString(36).substring(7) + '.sol';
    const contractFilePath = path.join(__dirname, 'contracts', randomFilename);
  
    fs.writeFileSync(contractFilePath, contractCode);
  
    exec('npx hardhat compile', (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        res.status(500).json({ error: 'Compilation error' });
        return;
      }
  
      const artifactsPath = path.join(__dirname, 'artifacts/contracts');
      const compiledOutput = require(path.join(artifactsPath, randomFilename, `${contractName}.json`));
      
      console.log(contractName + " compile success...")
      const response = {
        bytecode: compiledOutput.bytecode,
        abi: compiledOutput.abi
      };
      
      res.json(response);
    });
  });

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});