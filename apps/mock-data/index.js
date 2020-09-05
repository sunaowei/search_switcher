new Vue({
    el: '#pageContainer',
    data: {
        jsonData: null,
        path: null,
    },
    created: function () {

    },
    mounted: function () {

    },
    methods: {

        generateMockData: function () {
            this.getJsonData();
            if (!this.jsonData) {
                return;
            }

            this.getPathValue();
            if (!this.path) {
                return;
            }

            this.mockDataHandler();
        },

        copy: function () {
            let input = document.createElement('textarea');
            input.style.position = 'fixed';
            input.style.opacity = 0;
            input.value = document.querySelector('#container').textContent;
            document.body.appendChild(input);
            input.select();
            document.execCommand('Copy');
            document.body.removeChild(input);

            alert('Copy Success!')
        },

        mockDataHandler: function () {
            // 解析获得所有的Path
            let paths = this.jsonData['paths'];
            let data = null;
            for (let pathsKey in paths) {
                if (pathsKey === this.path) {
                    data = paths[pathsKey];
                }
            }

            if (!data) {
                alert("No Path【" + this.path + " 】。")
            }
            for (let method in data) {
                this.buildJsonResult(method, data[method]);
            }
        },

        buildJsonResult: function (method, pathData) {
            let result = {};
            result.id = this.getController(pathData) + '-' + pathData.operationId;
            result.url = this.path + this.getUrlData(pathData);
            result.method = method;
            result.header = this.getHeader(pathData);
            result.data = this.getData(pathData);
            result.turnOn = true;
            result.asserts = [];
            console.log(JSON.stringify(result));
            document.querySelector("#container").innerHTML = colorful(result);
        },

        getUrlData: function (data) {
            let result = "?";
            data.parameters.forEach(item => {
                if (item.in === 'query') {
                    result += (result.startsWith("?") ? '' : '&') + item.name + "=" + this.getValue(item.type, item.format)
                }
            });
            return result.length > 1 ? result : '';

        },

        getData: function (data) {
            if (!data.parameters || data.parameters.length < 1) {
                return {}
            }

            let result = {};
            data.parameters.forEach(item => {
                if (item.in === 'body') {
                    // 非obj的情况
                    if (!item.schema['$ref']) {
                        result[item.name] = this.getValue(item.schema.type);
                    } else {
                        let objResult = {};
                        // 获取ref
                        let def = item.schema['$ref'].substring(item.schema['$ref'].lastIndexOf('/') + 1);
                        let definition = this.jsonData.definitions[def];
                        for (let key in definition.properties) {
                            objResult[key] = this.getValue(definition.properties[key].type, definition.properties[key].format);
                        }
                        result[item.name] = objResult;
                    }
                }
            });
            return result;
        },

        getValue: function (type, format) {
            if (!type) {
                return null;
            }

            type = type.toLowerCase();
            switch (type) {
                case 'string':
                    if (format === 'date-time') {
                        return new Date();
                    } else {
                        return 'MockData'
                    }
                case 'boolean':
                    return false;
                case 'integer':
                    if (format === 'int64') {
                        return 123456789012345678
                    } else if (format === 'int32') {
                        return 123456
                    } else {
                        return 129
                    }
                default:
                    return 'Unknown Type';
            }
        },

        getHeader: function (data) {
            if (!data.parameters || data.parameters.length < 1) {
                return {}
            }
            let result = {};
            data.parameters.forEach(item => {
                if (item.in === 'header') {
                    result[item.name] = this.getValue(item.type);
                }
            });
            return result;
        },

        getController: function (data) {
            return data.tags[0].replace(/-(\w)/g, (all, letter) => {
                return letter.toUpperCase();
            });
        },

        getJsonData: function () {
            let jsonDataStr = document.querySelector("#jsonFileTextArea").value;
            try {
                this.jsonData = JSON.parse(jsonDataStr);
            } catch (e) {
                alert("Parse JSON Data Error");
                return;
            }
        },

        getPathValue: function () {
            this.path = document.querySelector("#pathInput").value;
            if (!this.path) {
                alert("Path cannot be empty");
            }
        }
    }
});
