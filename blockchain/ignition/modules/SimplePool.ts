import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const SimplePoolModule = buildModule("SimplePoolModule", (m) => {
  const simplePool = m.contract("SimplePool");
  const simpleToken = m.contract("SimpleToken");

  m.call(simplePool, "initialize", [simpleToken]);
  m.call(simpleToken, "initialize", [simplePool]);

  return { simplePool, simpleToken };
});

export default SimplePoolModule;
