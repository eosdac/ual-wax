import { Authenticator, Chain, User, UALError } from 'universal-authenticator-library'
import { WaxJS } from "@waxio/waxjs/dist"

import { WaxUser } from "./WaxUser";
import { WaxIcon } from './WaxIcon';
import {UALWaxError} from "./UALWaxError";
import {UALErrorType} from "universal-authenticator-library/dist";

export class Wax extends Authenticator {
    private wax?: WaxJS;
    private users: WaxUser[] = [];

    private initiated = false;

    constructor(chains: Chain[], options?: any) {
        super(chains, options);
    }

    /**
     * Called after `shouldRender` and should be used to handle any async actions required to initialize the authenticator
     */
    async init(): Promise<void> {
        this.initWaxJS();

        this.initiated = true;

        console.log(`UAL-WAX: init`);
    }


    /**
     * Resets the authenticator to its initial, default state then calls `init` method
     */
    reset() {
        this.wax = undefined;
        this.users = [];
        this.initiated = false;
    }


    /**
     * Returns true if the authenticator has errored while initializing.
     */
    isErrored() {
        return false;
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
        return null;
    }


    /**
     * Returns true if the authenticator is loading while initializing its internal state.
     */
    isLoading(): boolean {
        return !this.initiated;
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
        return false;
    }


    /**
     * Returns whether or not the button should show an account name input field.
     * This is for Authenticators that do not have a concept of account names.
     */
    async shouldRequestAccountName(): Promise<boolean> {
        return false;
    }

    /**
     * Returns the amount of seconds after the authentication will be invalid for logging in on new
     * browser sessions.  Setting this value to zero will cause users to re-attempt authentication on
     * every new browser session.  Please note that the invalidate time will be saved client-side and
     * should not be relied on for security.
     */
    public shouldInvalidateAfter(): number {
        return 86400;
    }

    /**
     * Login using the Authenticator App. This can return one or more users depending on multiple chain support.
     */
    async login(): Promise<User[]> {
        console.log(`UAL-WAX: login requested`);

        if (this.chains.length > 1 || this.chains[0].chainId !== '1064487b3cd1a897ce03ae5b6a865651747e2e152090f99c1d19d44e01aea5a4') {
            throw new UALWaxError('WAX Could Wallet only supports the WAX Mainnet',
                UALErrorType.Unsupported, null
            )
        }

        if (!this.wax) {
            throw new UALWaxError('WAX Cloud Wallet not initialized yet',
                UALErrorType.Initialization, null
            )
        }

        try {
            await this.wax.login();

            this.users = [new WaxUser(this.chains[0], this.wax)]

            console.log(`UAL-WAX: login`, this.users);

            return this.users
        } catch (e) {
            throw new UALWaxError(
                e.message ? e.message : 'Could not login to the WAX Cloud Wallet',
                UALErrorType.Login, e
            )
        }
    }


    /**
     * Logs the user out of the dapp. This will be strongly dependent on each Authenticator app's patterns.
     */
    async logout(): Promise<void> {
        this.initWaxJS();
        this.users = [];

        console.log(`UAL-WAX: logout`);
    }


    /**
     * Returns true if user confirmation is required for `getKeys`
     */
    requiresGetKeyConfirmation(): boolean {
        return false;
    }

    /**
     * Returns name of authenticator for persistence in local storage
     */
    getName(): string {
      return 'wax';
    }

    private initWaxJS() {
        const endpoint = `${this.chains[0].rpcEndpoints[0].protocol}://${this.chains[0].rpcEndpoints[0].host}:${this.chains[0].rpcEndpoints[0].port}`;
        this.wax = new WaxJS(endpoint, undefined, undefined, false);
    }
}
