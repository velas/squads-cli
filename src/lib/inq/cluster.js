import inquirer from "inquirer";
import { DEFAULT_CLUSTER } from "../constants"

export default () => {
    const questions = [
        {
            name: 'cluster',
            type: 'input',
            message: `Enter the rpc cluster to use (or enter for ${DEFAULT_CLUSTER}):`,
          }
      ];
      return inquirer.prompt(questions);
  };
