#!/usr/bin/env node
// 使用node开发命令行工具所执行的js脚本必须在顶部加入 #!/usr/bin/env node 生命
// #!/usr/bin/env node  告诉系统该脚本使用node运行，用户必须在系统变量中配置了node

const program = require('commander');

// 下载github仓库
const download = require('download-git-repo');

// 命令行交互
const inquirer = require('inquirer');

// 处理模板
const handlebars = require('handlebars');

// loading效果
const ora = require('ora');

// 给字体增加颜色
const chalk = require('chalk');

const fs = require('fs');

// 模板下载地址
const downloadUrl = 'direct:https://github.com/Hahahahx/ux-react-mobx-antd.git';

// 设置脚手架版本
program
    .version('0.1.1', '-v, --version');

// 跟用户进行交互
program
	// ux-react-cli create demoname
    .command('create <project>')
    // 添加描述
    .description('初始化项目模板')
    .action(function (projectName) {
        // 与用户交互
        inquirer
            .prompt([
            	// 输入项目名称
                {
                    type: 'input',
                    name: 'name',
                    message: '请输入项目名称：'
                },
                // 输入项目描述
                {
                    type: 'input',
                    name: 'description',
                    message: '请输入项目描述：'
                },
                // 输入项目作者
                {
                    type: 'input',
                    name: 'author',
                    message: '请输入项目作者：'
                },
                // 选择是否使用node-sass或者less
                // {
                //     type: 'confirm',
                //     name: 'cssStyle',
                //     message: '是否使用less/node-sass：'
                // },
                // // 选择使用node-sass或者less
                // {
                //     type: 'list',
                //     message: '请选择以下css预处理器:',
                //     name: 'preprocessor',
                //     choices: [
                //         "less",
                //         "sass"
                //     ],
                //     // 只有当用户在选择是否使用node-sass或者less时输入了yes才会显示该问题
                //     when: function (answers) {
                //         return answers.cssStyle
                //     }
                // }
            ])
            .then(answers => {
            	// 与用户交互完成后，处理用户的选择
            	
                let params = {
                    name: answers.name, // 项目名称
                    description: answers.description,// 项目描述
                    author: answers.author // 项目作者
                }
                // if (answers.cssStyle) {
                // 	//用户选择使用css预处理器
                	
                //     if (answers.preprocessor === 'less') {
                //     	// 用户选择使用less
                //         params.less = true;
                //         params.sass = false;
                //     } else if (answers.preprocessor === 'sass') {
                //    		// 用户选择使用sass
                //         params.less = false;
                //         params.sass = true;
                //     }
                // } else {
                // 	// 用户选择不使用css预处理器
                //     params.sass = false;
                //     params.less = false
                // }
                // 打印空行，使输出与输出之间有空行，增加体验效果
                console.log("");
                
                // 提示用户正在下载模板，并显示loading图标
                var spinner = ora('正在下载中...').start();
                
				// 下载模板到本地
                download(downloadUrl, projectName, { clone: true }, err => {
                    if (err) {
                        console.log(err);
                        spinner.text = '下载失败';
                        spinner.fail()  //下载失败
                    } else {
                    	// 获取模板的package.json的路径
                        let packagePath = `${projectName}/package.json`;
                        // 读取模板的package.json文件的内容
                        let packageStr = fs.readFileSync(packagePath, 'utf-8');
                        // 根据params参数替换掉模板的package.json文件内容的占位符
                        let package = handlebars.compile(packageStr)(params);
                        // 重新写入文件
                        fs.writeFileSync(packagePath, package);
                        if (params.sass) {
                        	// 由于国内网络原因，node-sass可能需要翻墙才能下载，所以如果用户选择了sass预处理器则需要创建.npmrc文件，并写入node-sass的代理下载地址
                            const npmrcPath = `${projectName}/.npmrc`;
                            const appendContent = '\r\nsass_binary_site=https://npm.taobao.org/mirrors/node-sass/'
                            if (!fs.existsSync(npmrcPath)) {
                                fs.writeFileSync(npmrcPath, appendContent)
                            } else {
                                fs.appendFileSync(npmrcPath, appendContent)
                            }
                        }
                        // 提示用户下载成功
                        spinner.text = '下载成功';
                        spinner.color = '#13A10E';
                        spinner.succeed();
                        console.log("");
                        // 提示进入下载的目录
                        console.log(" # cd into Project");
                        console.log(chalk.gray('   $ ') + chalk.blue(`cd ${projectName}`));
                        console.log("");
                        // 提示安装依赖
                        console.log(" # Project setup");
                        console.log(chalk.gray('   $ ') + chalk.blue(`npm install`));
                        console.log("");
                        // 提示运行开发环境
                        console.log(" # Compiles and hot-reloads for development");
                        console.log(chalk.gray('   $ ') + chalk.blue(`npm run dev`));
                        console.log("");
                        // 提示打包生产环境代码
                        console.log(" # Compiles and minifies for production");
                        console.log(chalk.gray('   $ ') + chalk.blue(`npm run build`));
                        console.log("")
                    }
                })
            });
    });

// 解析命令行参数
program.parse(process.argv);