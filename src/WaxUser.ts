import { User, Chain } from 'universal-authenticator-library'
import * as waxjs from "@waxio/waxjs/dist"

export class WaxUser extends User {
  public accountName: string;
  private pubKeys: [];
  private wax: any;
  private chain: Chain;

  constructor (chain, accountName, pubKeys) {
    super();

    this.accountName = accountName;
    this.pubKeys = pubKeys;
    this.chain = chain;

    const endpoint = `${chain.rpcEndpoints[0].protocol}://${chain.rpcEndpoints[0].host}:${chain.rpcEndpoints[0].port}`;
    this.wax = new waxjs.WaxJS(endpoint, accountName, pubKeys, true);
  }

  /**
   * @param transaction  The transaction to be signed (a object that matches the RpcAPI structure).
   */
  async signTransaction(transaction, _options) {
    return this.wax.api.transact(transaction, {blocksBehind: 3, expireSeconds: 30});
  }


  /**
   * @param publicKey   The public key to use for signing.
   * @param data        The data to be signed.
   * @param helpText    Help text to explain the need for arbitrary data to be signed.
   *
   * @returns           The signature
   */
  async signArbitrary(_publicKey, _data, _helpText): Promise<string> {
    return '';
  }

  /**
   * @param challenge   Challenge text sent to the authenticator.
   *
   * @returns           Whether the user owns the private keys corresponding with provided public keys.
   */
  async verifyKeyOwnership(_: string): Promise<boolean> {
    return true;
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
