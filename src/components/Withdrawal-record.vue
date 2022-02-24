<template>
  <div class="audit-container" id="audit">
    <h3>提现记录</h3>
    <!-- <div class="dialog-main" v-if="total == 0">
      <p>{{ withdrawalAuditMsg }}</p>
    </div> -->
    <div class="select">
      <el-form label-width="100px" id="report-input" ref="form" :label-position="labelPosition" st>
        <el-form-item label="审核状态:" style="margin:10px 0px 6px;">
          <el-select v-model="value" filterable placeholder="请选择" style="width: 500px;" @change="currentSel">
            <el-option v-for="item in withdrawalnum" :key="item.id" :label="item.state" :value="item.id"
              @click="currentSel">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <el-form label-width="100px" id="report-input" ref="form" :label-position="labelPosition">
        <el-form-item label="查询记录:" style="margin:10px 0px 6px;">
          <el-autocomplete style="width: 300px;" v-model="state1" :fetch-suggestions="querySearchAsync"
            placeholder="请输入手机号/支付宝账号/支付宝用户名进行查询" @select="handleSelect"><template slot-scope="{ item }">
              <span class="phone" style="font-size: 16px;">{{
                item.phoneNumber
              }}</span>
              <div class="name" style="font-size: 12px;">
                支付宝账户名：{{ item.name }}
              </div>
              <div class="name" style="font-size: 12px;">
                支付宝账号：{{ item.account }}
              </div>
            </template></el-autocomplete>

          <button type="button" class="top-search-button" @click="autocomplete" @change="autocomplete">
            查 询
          </button>
        </el-form-item>
      </el-form>
    </div>
    <div>
      <div v-show="total==0" style="margin: 30px;">暂无数据哦~</div>
      <table v-for="item in Withdrawal.list" :key="item.id">
        <tr v-if="currentSelval == 0">
          <td>
            <div style="text-align: left;margin-left: 100px;">
              <p>申请手机号：{{ item.phoneNumber }}</p>
              <p>申请时间：{{ item.subTime }}</p>
              <p>通过时间：{{ item.auditTime }}</p>
            </div>
          </td>
          <td style="text-align: left;">
            <span>支付宝账户：{{ item.account }}</span>
            <p>支付宝用户名：{{ item.name }}</p>
            <p>提现金额：{{ item.subMoney }}</p>
          </td>
          <td>
            <div v-if="item.flag == 1">
              <span>已提现</span>
            </div>
            <div v-if="item.flag == -1">
              <span>已拒绝</span>
            </div>
          </td>
        </tr>
        <tr v-if="item.flag == 1 && currentSelval == 1">
          <td>
            <div style="text-align: left;margin-left: 100px;">
              <p>申请手机号：{{ item.phoneNumber }}</p>
              <p>申请时间：{{ item.subTime }}</p>
              <p>通过时间：{{ item.auditTime }}</p>
            </div>
          </td>
          <td style="text-align: left;">
            <span>支付宝账户：{{ item.account }}</span>
            <button class="tag-read"></button>
            <p>支付宝用户名：{{ item.name }}</p>
            <p>提现金额：{{ item.subMoney }}</p>
          </td>
          <td>
            <div v-if="item.flag == 1">
              <span>已提现</span>
            </div>
            <div v-if="item.flag == -1">
              <span>已拒绝</span>
            </div>
          </td>
        </tr>
        <tr v-if="item.flag == -1 && currentSelval == 2">
          <td>
            <div style="text-align: left;margin-left: 100px;">
              <p>申请手机号：{{ item.phoneNumber }}</p>
              <p>申请时间：{{ item.subTime }}</p>
              <p>通过时间：{{ item.auditTime }}</p>
            </div>
          </td>
          <td style="text-align: left;">
            <span>支付宝账户：{{ item.account }}</span>
            <button class="tag-read"></button>
            <p>支付宝用户名：{{ item.name }}</p>
            <p>提现金额：{{ item.subMoney }}</p>
          </td>
          <td>
            <div v-if="item.flag == 1">
              <span>已提现</span>
            </div>
            <div v-if="item.flag == -1">
              <span>已拒绝</span>
            </div>
          </td>
        </tr>
      </table>

      <div style="width: 100%;height: 50px;">
        <div style="margin:15px 0;position:absolute;right:6%;">
          <el-pagination :current-page="page" layout="total, prev, pager, next, jumper" :total="total"
            @current-change="handleCurrentChange">
          </el-pagination>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        state1: "",
        withdrawalAuditMsg: "数据加载中...",
        Withdrawal: [],
        phonenumber: "",
        starttime: "",
        endtime: "",
        labelPosition: "right",
        withdrawalnum: [{
            id: 0,
            state: "全部记录",
          },
          {
            id: 1,
            state: "已通过",
          },
          {
            id: 2,
            state: "已拒绝",
          },
        ],
        value: "全部记录",
        currentSelval: 0,
        list: [],
        total: 0,
        page: 1,
        pageNum: 10,
        dialogWithdrawalPassVisible: false,
        recordId: "",
        dialogWithdrawalRefuseVisible: false,
        refuseId: "",
        loading: false,
        restaurants: [],
        inpuntstring: "",
        keyword: "",
        clicknum: 0,
      };
    },
    methods: {
      withdrawaltotal() {
        this.$axios
          .post(this.$store.state.baseUrl + "/withdrawalList?java", {
            keyword: this.keyword,
            startTime: this.starttime,
            endTime: this.endtime,
            page: this.page,
            pageNum: this.pageNum
          })
          .then((res) => {
            this.Withdrawal = res.data;
            this.total = res.data.listNum;
            this.page = 1;
            console.log(this.total);
            if (this.clicknum == 1 && res.data.listNum == 0) {
              this.$message({
                message: '请检查输入信息，不存在该条记录！',
                type: 'error',
                showClose: true,
              })
            };
          })
      },
      currentSel(val) {
        this.currentSelval = val;
        this.withdrawaltotal();
      },
      querySearchAsync(queryString, cb) {
        let restaurants = this.Withdrawal.list;
        this.inpuntstring = queryString;
        if (!queryString) {
          this.keyword = "";
          this.withdrawaltotal() //清空输入框时重新加载全部数据 
        }

        for (let items of restaurants) {
          items.value = items.name; //提示框显示内容
        }
        let results = queryString ?
          restaurants.filter(this.createFilter(queryString)) :
          restaurants;
        console.log(results);
        cb(results);
      },
      createFilter(queryString) {
        return (restaurant) => {
          //匹配内容
          return (
            restaurant.name.toLowerCase().indexOf(queryString.toLowerCase()) === 0,
            restaurant.phoneNumber.toLowerCase().indexOf(queryString.toLowerCase()) === 0,
            restaurant.account.toLowerCase().indexOf(queryString.toLowerCase()) === 0
          );
        };
      },
      handleSelect(item) {
        // 提示框--选择显示
        console.log(item);
        this.keyword = item.phoneNumber;
        this.withdrawaltotal();
      },
      // 查询按钮
      autocomplete() {
        if (!this.inpuntstring) {
          this.$message({
            showClose: true,
            message: '请输入查询信息',
            type: 'warning'
          });
        }
        this.clicknum = 1;
        this.keyword = this.inpuntstring;
        this.withdrawaltotal();
      },
      // 分页
      handleCurrentChange(val) {
        console.log(`当前页: ${val}`);
        this.page = val;
        this.withdrawaltotal()
      }
    },
    mounted() {
      this.withdrawaltotal();
    },
  };
</script>

<style lang="scss" scoped>
  .select {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: space-around;
  }

  .audit-container {
    width: 92%;
    margin: 0 auto;
    padding: 30px;
    background-color: #fff;
    border-radius: 30px;

    .tag-read {
      width: 20px;
      height: 20px;
      margin-left: 5px;
      border: 0;
      background: url("../assets/imgs/copy.png") no-repeat;
      background-size: cover;
      cursor: pointer;
    }

    .dialog-main {
      text-align: center;
    }

    td {
      height: 60px;
      margin: 10px 0;
      padding: 10px 0;
      background-color: #f3fbf9;
      font-size: 15px;
      text-align: center;

    }

    table {
      width: 100%;
      table-layout: fixed;
      border-collapse: separate;
      border-spacing: 0;
      margin-top: 10px;

      tr {

        th,
        td {
          width: 33%;
          text-align: center;
          border: 0;
        }
      }
    }
  }
</style>
<style lang="scss">
  #audit {

    .top-search-button {
      width: 100px;
      height: 36px;
      background-color: #0c7063;
      font-size: 13px;
      color: #fff;
      outline: none;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      margin-left: 6px;
    }

    .el-input__inner {
      height: 35px;
      border-radius: 5px;
    }
  }
</style>