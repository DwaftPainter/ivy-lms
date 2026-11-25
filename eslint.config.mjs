import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
    ...nextVitals,
    ...nextTs,

    {
        rules: {
            // Fail build nếu có biến unused
            "@typescript-eslint/no-unused-vars": [
                "error",
                {
                    argsIgnorePattern: "^_",
                    varsIgnorePattern: "^_"
                }
            ],

            "no-console": [
                "error",
                {
                    allow: ["warn", "error"]
                }
            ],
            "@typescript-eslint/no-explicit-any": "warn",
            eqeqeq: "error"
        }
    },

    globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"])
]);

export default eslintConfig;
