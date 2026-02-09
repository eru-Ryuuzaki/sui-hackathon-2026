export declare class ZkLoginController {
    private readonly MASTER_SEED;
    private readonly BN254_PRIME;
    getSalt(sub: string): {
        salt: string;
        sub: string;
    };
}
