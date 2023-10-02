const mysql = require('mysql2');
const db = require('./config.json');

class Model {
    constructor(table) {
        this.table = table;
    }

    _connect(query) {
        let result;
        this.connection = mysql.createConnection({
            host     : db.host,
            user     : db.user,
            password : db.password,
            database : db.data_base
        });
        this.connection.connect();
        try {
            result = this.connection.promise().query(query);
        } catch (err) {
            result = err;
        }
        this.connection.end();
        return result;
    }
    
    async save(data) {
        const dataes = [];
        const renew = [];
        const clues = [];
        let query;

        for (const arg in data) {
            if (arg !== 'id') {
            clues.push(arg);
            dataes.push(`'${data[arg]}'`);
            renew.push(`${arg}='${data[arg]}'`);
            }
        }
        if(!data.id) {
            query = `INSERT ${this.table} (${clues}) VALUES (${dataes});`;
        } else {
            query = "UPDATE " + this.table + " SET " + renew + " WHERE id=" + data.id + ';';
        }
        await this._connect(query);
        return this;
    }
    
    async delete() {
        if(this.data[0]) { 
        }
        else {
            return false;
        }
        let query = "SELECT * FROM " + this.table + " WHERE id=" + this.data[0].id + ';';
        let [rows,fields] = await this._connect(query);
        if(!rows) {
            return false;
        } else {
            let query = "DELETE FROM " + this.table + " WHERE id=" + this.data[0].id + ';';
            let [rows,fields] = await this._connect(query);
            if(!rows) {
                return false;
            } else {
                return true;
            }
        }
    }   

    async deleteUser(id) {
        if (!id) {
            return false;
        }
        const query = `DELETE FROM ${this.table} WHERE id=${id};`;
        const [result] = await this._connect(query);
        if (result.affectedRows > 0) {
            return true;
        } else {
            return false;
        }
    }

    async getList(info) {
        const dataes = [];
        const clues = [];
        const place = [];
      
        for (const arg in info) {
          if (arg !== "id") {
            clues.push(arg);
            dataes.push(`'${info[arg]}'`);
            place.push(`${arg}='${info[arg]}'`);
          }
        }
      
        const query = `SELECT * FROM ${this.table} WHERE ${place.join(" AND ")};`;
        const [rows] = await this._connect(query);
      
        return rows;
    }      

    find(id) {
        const query = `SELECT * FROM ${this.table} WHERE id=${id};`;
        const [rows, fields] = this._connect(query);
        
        if (rows) {
          rows.forEach(item => {
            this.data.push(item);
          });
        }
        
        return this;
      }      
}

module.exports = Model;