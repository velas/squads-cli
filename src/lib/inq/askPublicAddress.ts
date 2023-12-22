import { web3 } from "@coral-xyz/anchor"
import inquirer, { QuestionCollection } from "inquirer"

export default async (message: string) => {
const questions: QuestionCollection = [
    {
        name: 'publicAddress',
        type: 'input',
        message,
        validate: function( value ) {
            if (value.length > 0 ) {
                try {
                    new web3.PublicKey(value)
                    return true
                } catch (e) { }
            }
            return 'Please enter a valid publicKey (base58)'
        },
    }]
    return inquirer.prompt(questions)
}
