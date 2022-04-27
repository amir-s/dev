import "colors";

export const generic = () => {
  console.log("No command specified.".gray);
};

export const shellInstallSuccess = (installCommand, file) => {
  console.log(`\n Command "${installCommand}" added to "${file}".`.gray);
  console.log(` ${"You can now use".gray} ${"dev".green} ${"command".gray}`);
  console.log(
    `\n ${"You can customize the name of the function (dev) with\n\n".gray} ${
      " dev config set shell.function <name>\n\n".green
    }${
      " to use something other than `dev`. You restart your terminal or run the following command for changes to take effect:\n\n"
        .gray
    } ${` source ${file}`.green}`
  );
};
