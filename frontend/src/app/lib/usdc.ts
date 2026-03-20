export function toUsdcAmount(value: string) {
    const [whole, decimal = ""] = value.split(".");
    const padded = (decimal + "000000").slice(0, 6);
    return BigInt(`${whole || "0"}${padded}`);
  }
  
export function fromUsdcAmount(value: bigint | number | string) {
    const raw = BigInt(value).toString().padStart(7, "0");
    const whole = raw.slice(0, -6) || "0";
    const decimal = raw.slice(-6).replace(/0+$/, "");
    return decimal ? `${whole}.${decimal}` : whole;
  }