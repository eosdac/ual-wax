import {Chain, SignTransactionResponse, User, UALErrorType} from 'universal-authenticator-library'
import {WaxJS} from "@waxio/waxjs/dist"
import {UALWaxError} from "./UALWaxError";

export class WaxUser extends User {
    public readonly accountName: string;
    public readonly requestPermission: string;

    private readonly pubKeys: string[];
    private readonly wax: WaxJS;
    private readonly chain: Chain;

    public api: any;
    public rpc: any;

    constructor(chain: Chain, userAccount: string, pubKeys: string[], wax: WaxJS) {
        super();

        this.accountName = userAccount;
        this.pubKeys = pubKeys;
        this.requestPermission = 'active';

        this.chain = chain;
        this.wax = wax;

        // compatible features
        this.api = wax.api;
        this.rpc = wax.api && wax.api.rpc;
    }

    /**
     * @param transaction  The transaction to be signed (a object that matches the RpcAPI structure).
     * @param options  Options for tapos fields
     */
    async signTransaction(transaction: any, options: any): Promise<SignTransactionResponse> {
        try {
            const account = await this.wax.login();

            if (account !== this.accountName) {
                throw new Error('Account does not match the requested permission');
            } else {
                this.api = this.wax.api;
                this.rpc = this.wax.api.rpc;
            }

            const completedTransaction = await this.wax.api.transact(transaction, options);

            return this.returnEosjsTransaction(options.broadcast !== false, completedTransaction);
        } catch (e) {
            throw new UALWaxError(
                e.message ? e.message : 'Unable to sign transaction',
                UALErrorType.Signing, e
            );
        }
    }

    async signArbitrary(): Promise<string> {
        throw new UALWaxError(
            'WAX Cloud Wallet does not currently support signArbitrary',
            UALErrorType.Unsupported, null
        );
    }

    async verifyKeyOwnership(): Promise<boolean> {
      throw new UALWaxError(
          'WAX Cloud Wallet does not currently support verifyKeyOwnership',
          UALErrorType.Unsupported, null
      );
    }

    async getAccountName(): Promise<string> {
        return this.accountName;
    }

    async getChainId(): Promise<string> {
        return this.chain.chainId;
    }

    async getKeys() {
        return this.pubKeys;
    }
}
