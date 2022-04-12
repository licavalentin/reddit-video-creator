import { Config } from "remotion";
import { cpus } from "os";

Config.Rendering.setImageFormat("png");

Config.Output.setOverwriteOutput(true);

Config.Rendering.setConcurrency(cpus().length);

Config.Bundling.overrideWebpackConfig((currentConfiguration) => {
  return {
    ...currentConfiguration,
    module: {
      ...currentConfiguration.module,
      rules: [
        ...(currentConfiguration.module?.rules
          ? currentConfiguration.module.rules
          : []),
        {
          test: /\.s[ac]ss$/i,
          use: [
            { loader: "style-loader" },
            { loader: "css-loader" },
            { loader: "sass-loader", options: { sourceMap: true } },
          ],
        },
      ],
    },
  };
});
