import Cooldown from "../structures/cooldown";

const updateCooldown = (cooldown:Cooldown) => {
    cooldown.lastUsed = Date.now();
    cooldown.timesUsed += 1;
};

export default updateCooldown;