import { Linter } from 'eslint';
import tsparser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';

const baseConfig: Linter.Config = {

    name: 'recommended-ts-rules',
    files: ['*.ts'],
    ignores: [],
    languageOptions: {
        parser: tsparser,
        parserOptions: {
            projectService: true,
            tsconfigRootDir: import.meta.dirname,
        },
    },
    linterOptions: {},
    plugins: {
        // @ts-expect-error : https://github.com/typescript-eslint/typescript-eslint/issues/10899
        '@typescript-eslint': tsPlugin
    },
    rules: {
        '@typescript-eslint/await-thenable': 'error',
        '@typescript-eslint/ban-ts-comment': ['error', {
            'ts-expect-error': 'allow-with-description',
            'ts-check': true,
        }],
        '@typescript-eslint/no-array-constructor': 'error',
        '@typescript-eslint/no-array-delete': 'error',
        '@typescript-eslint/no-base-to-string': 'error',
        '@typescript-eslint/no-duplicate-enum-values': 'error',
        '@typescript-eslint/no-duplicate-type-constituents': 'error',
        '@typescript-eslint/no-empty-object-type': 'error',
        '@typescript-eslint/no-explicit-any': ['error',
            { "fixToUnknown": true }
        ],
        '@typescript-eslint/no-extra-non-null-assertion': 'error',
        '@typescript-eslint/no-floating-promises': ['error', {
            checkThenables: true,
            ignoreVoid: false,
        }
        ],
        '@typescript-eslint/no-for-in-array': 'error',
        '@typescript-eslint/no-implied-eval': 'error',
        '@typescript-eslint/no-misused-new': 'error',
        '@typescript-eslint/no-misused-promises': 'error',
        '@typescript-eslint/no-namespace': 'error',
        '@typescript-eslint/no-non-null-asserted-optional-chain': 'error',
        '@typescript-eslint/no-redundant-type-constituents': 'error',
        '@typescript-eslint/no-require-imports': 'error',
        '@typescript-eslint/no-this-alias': 'error',
        '@typescript-eslint/no-unnecessary-type-assertion': ['error', {
            checkLiteralConstAssertions: true
        }],
        '@typescript-eslint/no-unnecessary-type-constraint': 'error',
        '@typescript-eslint/no-unsafe-argument': 'error',
        '@typescript-eslint/no-unsafe-assignment': 'error',
        '@typescript-eslint/no-unsafe-call': 'error',
        '@typescript-eslint/no-unsafe-declaration-merging': 'error',
        '@typescript-eslint/no-unsafe-enum-comparison': 'error',
        '@typescript-eslint/no-unsafe-function-type': 'error',
        '@typescript-eslint/no-unsafe-member-access': 'error',
        '@typescript-eslint/no-unsafe-return': 'error',
        '@typescript-eslint/no-unsafe-unary-minus': 'error',
        '@typescript-eslint/no-unused-expressions': 'error',
        '@typescript-eslint/no-unused-vars': ['error', {
            args: 'all',
        }],
        '@typescript-eslint/no-wrapper-object-types': 'error',
        '@typescript-eslint/only-throw-error': ['error', {
            allowRethrowing: false,
            allowThrowingAny: false,
            allowThrowingUnknown: false,
        }],
        '@typescript-eslint/prefer-as-const': 'error',
        '@typescript-eslint/prefer-namespace-keyword': 'error',
        '@typescript-eslint/prefer-promise-reject-errors': 'error',
        '@typescript-eslint/require-await': 'error',
        '@typescript-eslint/restrict-plus-operands': ['error', {
            allowAny: false,
            allowBoolean: false,
            allowNullish: false,
            allowNumberAndString: false,
            allowRegExp: false,
        }],
        '@typescript-eslint/restrict-template-expressions': ['error', {
            allowAny: false,
            allowBoolean: false,
            allowNever: false,
            allowNullish: false,
            allowNumber: false,
            allowRegExp: false,
        }],
        '@typescript-eslint/triple-slash-reference': 'error',
        '@typescript-eslint/unbound-method': 'error',
    },
    settings: {},
}

const strictConfig: Linter.Config = {
    name: 'strict-ts-rules',
    files: ['src/**/*.ts', 'tests/**/*.ts'],
    ignores: [],
    languageOptions: {
        parser: tsparser,
        parserOptions: {
            projectService: true,
            tsconfigRootDir: import.meta.dirname,
        },
    },
    linterOptions: {},
    plugins: {
        // @ts-expect-error : https://github.com/typescript-eslint/typescript-eslint/issues/10899
        '@typescript-eslint': tsPlugin
    },
    rules: {
        '@typescript-eslint/no-confusing-void-expression': 'error',
        '@typescript-eslint/no-deprecated': 'error',
        '@typescript-eslint/no-dynamic-delete': 'error',
        '@typescript-eslint/no-extraneous-class': 'error',
        '@typescript-eslint/no-invalid-void-type': ['error', {
            allowInGenericTypeArguments: false,
        }],
        '@typescript-eslint/no-meaningless-void-operator': ['error', {
            checkNever: true,
        }],
        '@typescript-eslint/no-misused-spread': 'error',
        '@typescript-eslint/no-mixed-enums': 'error',
        '@typescript-eslint/no-non-null-asserted-nullish-coalescing': 'error',
        '@typescript-eslint/no-non-null-assertion': 'error',
        '@typescript-eslint/no-unnecessary-boolean-literal-compare': ['error', {
            allowComparingNullableBooleansToFalse: false,
            allowComparingNullableBooleansToTrue: false,

        }],
        '@typescript-eslint/no-unnecessary-condition': ['error', {
            checkTypePredicates: true,
        }],
        '@typescript-eslint/no-unnecessary-template-expression': 'error',
        '@typescript-eslint/no-unnecessary-type-arguments': 'error',
        '@typescript-eslint/no-unnecessary-type-parameters': 'error',
        '@typescript-eslint/no-useless-constructor': 'error',
        '@typescript-eslint/prefer-literal-enum-member': 'error',
        '@typescript-eslint/prefer-reduce-type-parameter': 'error',
        '@typescript-eslint/prefer-return-this-type': 'error',
        '@typescript-eslint/related-getter-setter-pairs': 'error',
        '@typescript-eslint/return-await': ['error', 'in-try-catch'],
        '@typescript-eslint/unified-signatures': 'error',
        '@typescript-eslint/use-unknown-in-catch-callback-variable': 'error',
    },
}

const config: Array<Linter.Config> = [baseConfig, strictConfig];

export default config;
