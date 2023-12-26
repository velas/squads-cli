import { web3 } from "@coral-xyz/anchor"
import inquirer, { QuestionCollection } from "inquirer"

export default (message: string) => {
   const questions: QuestionCollection = [
      {
         name: "vlx",
         type: "input",
         message,
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
