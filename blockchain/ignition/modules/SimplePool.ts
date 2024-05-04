import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const SimplePoolModule = buildModule("SimplePoolModule", (m) => {
  const simplePool = m.contract("SimplePool");

  return { simplePool };
});

export default SimplePoolModule;
