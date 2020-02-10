import {appendFileSync, Dirent, promises} from "fs";

export class DocsifyAutoGen {
    constructor() {
        if (process.argv[3] == '--without-dic') {
            this.defaultProps.hasSelf = false;
            this.defaultProps.stage = '';
        }
    }

    defaultProps = {
        hasSelf: true,
        count: 0,
        stage: '\t'
    }

    run = async () => {
        appendFileSync('./_sidebar.md', '');
        this.searchFile(process.argv[2], '');
    }

    searchFile = async (path: string, stage: string) => {
        let localDir = await promises.opendir(path);
        for await (let seek of localDir) {
            if (this.isDic(seek)) {
                if (this.defaultProps.hasSelf) {
                    let label = seek.name;
                    this.sidebarWrite(label, label, `${localDir.path}/${seek.name}`.slice(process.argv[2].length), stage)
                        .then(res => {
                            this.fileSet(res);
                        })
                }
                await this.searchFile(path + '/' + seek.name, stage + this.defaultProps.stage);
            } else {
                if (seek.name[0] == '_' || seek.name[0] == '.') {
                    console.log('File ' + seek.name + ' is hidden will not add!');
                } else if (seek.name == 'index.html') {
                    console.log('File index.html is ignore!');
                } else if (seek.name == 'README.md') {
                    console.log('File README is ignore!');
                } else {
                    let label = seek.name.slice(0, seek.name.indexOf('.'));
                    this.sidebarWrite(label, label, `${localDir.path}/${seek.name}`.slice(process.argv[2].length), stage)
                        .then(res => {
                            this.fileSet(res);
                        })
                }
            }
        }
    }

    isDic = (name: Dirent): Boolean => {
        return name.isDirectory();
    }

    sidebarWrite = (title: String, label: String, Url: String, stage: string) => {
        return new Promise((resolve, reject) => {
            resolve(stage + `* [${label}](${Url} "${title}")`);
        })
    }

    fileSet = (link: unknown) => {
        appendFileSync('./_sidebar.md', link + '\n');
    }

}

new DocsifyAutoGen().run().then(res => console.log('End!\n Please move `_sidebar.md` to docsify root'));
