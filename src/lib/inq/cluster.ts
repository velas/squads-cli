import inquirer from "inquirer";
import { CLUSTER } from "../constants"

export default () => {
    const questions = [
        {
            default: CLUSTER,
            name: 'cluster',
            type: 'input',
            message: `Enter the rpc cluster to use:`,
          }
      ];
      return inquirer.prompt(questions);
  };
