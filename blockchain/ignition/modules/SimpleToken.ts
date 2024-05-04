import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const SimpleTokenModule = buildModule("SimpleTokenModule", (m) => {
  const simpleToken = m.contract("SimpleToken");

  return { simpleToken };
});

export default SimpleTokenModule;
