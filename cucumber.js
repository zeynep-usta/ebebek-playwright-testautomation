module.exports = {
    default: {

        paths: [
            "features/**/*.feature"
        ],

        require: [
            "step_definitions/**/*.js",
            "support/**/*.js"
        ],

        format: [
            "progress",
            "summary",
            "allure-cucumberjs/reporter"
        ],
        formatOptions: {
            resultsDir: "allure-results"
        }
    }
}