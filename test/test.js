const { fixture } = deployments;
const BigNumber = require("bignumber.js");
const { printGas, tokens, toWei } = require("./utils");
const { ParaSwap } = require("paraswap");
const { SwapSide } = require("paraswap-core");
const networkID = 137;
const partner = "paraswap";
const apiURL = "https://apiv5.paraswap.io";
const slippage = 1; // 1%
const { expect } = require("chai");
const { ethers } = require("hardhat");
const axios = require("axios");
const SwapperV1 = artifacts.require("SwapperV1");
const IBalancerRegistry = artifacts.require("IBalancerRegistry");
const IUniswapV2Factory = artifacts.require("IUniswapV2Factory");
const IERC20 = artifacts.require("IERC20");

const WETH_ADDRESS = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const DAI_ADDRESS = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
const LINK_ADDRESS = "0x514910771AF9Ca656af840dff83E8264EcF986CA";
const USDT_ADDRESS = "0xdac17f958d2ee523a2206206994597c13d831ec7";

const BALANCER_REGISTRY = "0x65e67cbc342712DF67494ACEfc06fe951EE93982";
const UNI_FACTORY = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";

// HELPERS
const fromWei = (value) => Number(web3.utils.fromWei(String(value)));

const FEE = 100; // 0.1%


function getToken(symbol) {
  const token = tokens[networkID].find((t) => t.symbol === symbol);

  if (!token)
    throw new Error(`Token ${symbol} not available on network ${networkID}`);
  return token;
}


contract("Swapper", ([user, feeRecipient]) => {
  let swapper, uniRouter, dai, link;

  before(async function () {
    dai = await IERC20.at(DAI_ADDRESS);
    link = await IERC20.at(LINK_ADDRESS);
    usdt = await IERC20.at(USDT_ADDRESS);
    balancer = await IBalancerRegistry.at(BALANCER_REGISTRY);
    factory = await IUniswapV2Factory.at(UNI_FACTORY);
    [_owner, _user] = await ethers.getSigners();
    
  });

  it("Should deploy proxy with V1", async function () {
    const SwapperV1Factory = await ethers.getContractFactory("SwapperV1");

    const proxy = await upgrades.deployProxy(SwapperV1Factory, [
      feeRecipient,
      FEE,
    ]);
    swapper = await SwapperV1.at(proxy.address);
  });


  it("Should use swapper tool", async function () {
    const distribution = [3000, 7000]; // 30% and 70%
    const tokens = [DAI_ADDRESS, LINK_ADDRESS];
    const intialFeeRecipientBalance = await web3.eth.getBalance(feeRecipient);

    const tx = await swapper.swap(tokens, distribution, { value: toWei(2) });

    const balanceDAI = await dai.balanceOf(user);
    const balanceLINK = await link.balanceOf(user);
  
    const contractBalance = await web3.eth.getBalance(swapper.address);
    const finalFeeRecipientBalance = await web3.eth.getBalance(feeRecipient);

    assert.notEqual(balanceDAI, 0);
    assert.notEqual(balanceLINK, 0);
    assert.equal(contractBalance, 0);

    assert(
      fromWei(finalFeeRecipientBalance) > fromWei(intialFeeRecipientBalance)
    );
  });

});








