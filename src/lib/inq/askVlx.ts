import { web3 } from "@coral-xyz/anchor"
import inquirer, { QuestionCollection } from "inquirer"

export default () => {
   const questions: QuestionCollection = [
      {
         name: "vlx",
         type: "input",
         message: "Enter VLX amount to withdraw from Stake Account:",
         validate: function (value) {
            const isNumber = /^[1-9]+[0-9]*$/
            if (!isNumber.test(value)) {
               return "Please, enter a valid integer"
            }
            return true
         },
      },
   ]
   return inquirer.prompt(questions)
}
