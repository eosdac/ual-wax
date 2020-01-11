import {
    Authenticator,
    Chain,
    User,
    UALError,
} from 'universal-authenticator-library'
import {WaxUser} from "./WaxUser";
import {WaxIcon} from './WaxIcon';
import * as waxjs from "@waxio/waxjs/dist"

export class Wax extends Authenticator {
    private wax?: any = null;
    public chains: Chain[];
    private users: WaxUser[] = [];
    private pubKeys: [];
    appName = 'WAX Cloud Wallet';
    lastError = null;
    accountName = null;

    constructor(chains: Chain[], options?: Object) {
        super(chains, options);

        const endpoint = `${chains[0].rpcEndpoints[0].protocol}://${chains[0].rpcEndpoints[0].host}:${chains[0].rpcEndpoints[0].port}`;
        this.wax = new waxjs.WaxJS(endpoint, null, null, false);

        this.chains = chains;
    }

    /**
     * Called after `shouldRender` and should be used to handle any async actions required to initialize the authenticator
     */
    async init(): Promise<void> {
        console.log(`WAX: init`);
    }


    /**
     * Resets the authenticator to its initial, default state then calls `init` method
     */
    reset() {
    }


    /**
     * Returns true if the authenticator has errored while initializing.
     */
    isErrored() {
        return (this.lastError !== null);
    }


    /**
     * Returns a URL where the user can download and install the underlying authenticator
     * if it is not found by the UAL Authenticator.
     */
    getOnboardingLink() {
        return 'https://all-access.wax.io/';
    }


    /**
     * Returns error (if available) if the authenticator has errored while initializing.
     */
    getError(): UALError | null {
        return this.lastError;
    }


    /**
     * Returns true if the authenticator is loading while initializing its internal state.
     */
    isLoading(): boolean {
        return false;
    }


    /**
     * Returns the style of the Button that will be rendered.
     */
    getStyle() {
        return {
            icon: WaxIcon,
            text: 'WAX Cloud Wallet',
            textColor: 'white',
            background: '#111111'
        }
    }


    /**
     * Returns whether or not the button should render based on the operating environment and other factors.
     * ie. If your Authenticator App does not support mobile, it returns false when running in a mobile browser.
     */
    shouldRender() {
        return true;
    }


    /**
     * Returns whether or not the dapp should attempt to auto login with the Authenticator app.
     * Auto login will only occur when there is only one Authenticator that returns shouldRender() true and
     * shouldAutoLogin() true.
     */
    shouldAutoLogin() {
        return true;
    }


    /**
     * Returns whether or not the button should show an account name input field.
     * This is for Authenticators that do not have a concept of account names.
     */
    async shouldRequestAccountName(): Promise<boolean> {
        return false;
    }


    /**
     * Login using the Authenticator App. This can return one or more users depending on multiple chain support.
     *
     * @param accountName  The account name of the user for Authenticators that do not store accounts (optional)
     */
    async login(): Promise<User[]> {
        try {
            const isAutoLoginAvailable = await this.wax.isAutoLoginAvailable();
            if (!isAutoLoginAvailable) {
                this.accountName = await this.wax.login();
            } else {
                this.accountName = this.wax.userAccount;
            }

            this.pubKeys = this.wax.pubKeys;
            for (const chain of this.chains) {
                const user = new WaxUser(chain, this.accountName, this.pubKeys);
                this.users.push(user);
            }

            console.log(`WAX: users`, this.users);

            return this.users
        } catch (e) {
            console.error(`WAX Login error`, e);
        }

        return [];
    }


    /**
     * Logs the user out of the dapp. This will be strongly dependent on each Authenticator app's patterns.
     */
    async logout(): Promise<void> {
        this.users = [];
        this.pubKeys = [];
    }


    /**
     * Returns true if user confirmation is required for `getKeys`
     */
    requiresGetKeyConfirmation(accountName?: string): boolean {
        if (!accountName) {
            return true;
        }
        return false;
    }
}
