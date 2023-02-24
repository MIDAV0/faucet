const IFaucet = artifacts.require("IFaucet");

module.exports = function (deployer) {
  deployer.deploy(IFaucet);
};