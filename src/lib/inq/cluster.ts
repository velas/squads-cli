import inquirer from "inquirer";
import { CLUSTER } from "../constants"

export default () => {
    const questions = [
        {
            name: 'cluster',
            type: 'input',
            message: `Enter the rpc cluster to use (or enter for ${CLUSTER}):`,
          }
      ];
      return inquirer.prompt(questions);
  };
