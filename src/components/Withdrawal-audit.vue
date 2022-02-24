<template>
  <div class="audit-container" id="audit">
    <!-- <h3>提现审核</h3> -->
    <div class="dialog-main" v-if="unAuditWithdrawalList.length == 0">
      <p>{{ withdrawalAuditMsg }}</p>
    </div>
    <div v-else>
      <table v-for="(item, index) in list" :key="index">
        <tr>
          <td>
            <div style="text-align: left;margin-left: 100px;">
              <p>申请手机号：{{ item.phoneNumber }}</p>
            <p>申请时间：{{ shellDate(item.createTime) }}</p>
            </div>
            
          </td>
          <td style="text-align: left;">
            <span>支付宝账户：{{ item.account }}</span>
            <button
              class="tag-read"
              :data-clipboard-text="item.phoneNumber"
              @click="copyBankAccount"
            ></button>
            <p>支付宝用户名：{{ item.name }}</p>
            <p>提现金额：{{ formatNumberRgx(item.subMoney) }}</p>
          </td>
          <td>
            <el-button type="success" @click="passClick(item.id)"
              >通过</el-button
            >
            <el-dialog
              title="开卡审核"
              :visible.sync="dialogWithdrawalPassVisible"
              :modal-append-to-body="false"
              center
            >
              <div class="dialog-main">
                <p>确定通过该提现申请？</p>
              </div>
              <div slot="footer">
                <el-button @click="dialogWithdrawalPassVisible = false"
                  >取 消</el-button
                >
                <el-button type="primary" @click="passClickSure"
                  >确 定</el-button
                >
              </div>
            </el-dialog>
            <el-button
              style="margin-left: 10%;"
              type="danger"
              @click="refuseClick(item.id)"
              >拒绝</el-button
            >
            <el-dialog
              title="开卡审核"
              :visible.sync="dialogWithdrawalRefuseVisible"
              :modal-append-to-body="false"
              center
            >
              <div class="dialog-main">
                <p>确定拒绝？确定后不可更改</p>
              </div>
              <div slot="footer">
                <el-button @click="dialogWithdrawalRefuseVisible = false"
                  >取 消</el-button
                >
                <el-button type="primary" @click="refuseClickSure"
                  >确 定</el-button
                >
              </div>
            </el-dialog>
          </td>
        </tr>
      </table>

      <div style="width: 100%;height: 50px;">
        <div style="margin:15px 0;position:absolute;right:6%;">
          <el-pagination
            @current-change="handleCurrentChange"
            :current-page="page"
            layout="total, prev, pager, next, jumper"
            :total="total"
          >
          </el-pagination>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Clipboard from "clipboard";
export default {
  data() {
    return {
      withdrawalAuditMsg: "数据加载中...",
      unAuditWithdrawalList: [],
      list: [],
      total: 0,
      page: 1,
      pageNum: 10,
      dialogWithdrawalPassVisible: false,
      recordId: "",
      dialogWithdrawalRefuseVisible: false,
      refuseId: "",
    };
  },
  created() {
    this.getunAuditWithdrawalList();
  },
  methods: {
    // 获取未审核提现记录
    getunAuditWithdrawalList() {
      this.withdrawalAuditMsg = "数据加载中...";
      this.$axios
        .post(this.$store.state.baseUrl + "/unAuditWithdrawalList?java")
        .then((res) => {
          console.log("获取未审核提现记录");
          console.log(res);
          this.unAuditWithdrawalList = res.data.list;
          if (this.unAuditWithdrawalList.length == 0) {
            this.withdrawalAuditMsg = "啊哦~暂无数据";
          }
          this.getList();
        })
        .catch((err) => {
          console.log(err);
        });
    },
    // 复制支付宝账号
    copyBankAccount() {
      let clipboard = new Clipboard(".tag-read");
      clipboard.on("success", (e) => {
        this.$message.success({
          message: "复制成功",
          showClose: true,
          duration: 2000,
        });
        console.log("复制成功", e);
        // 释放内存
        clipboard.destroy();
      });
      clipboard.on("error", (e) => {
        // 不支持复制
        this.$message.error({
          message: "复制失败，该浏览器不支持自动复制",
          showClose: true,
          duration: 2000,
        });
        console.log("该浏览器不支持自动复制", e);
        // 释放内存
        clipboard.destroy();
      });
    },
    // 审核通过
    passClick(id) {
      this.recordId = id;
      this.dialogWithdrawalPassVisible = true;
    },
    // 确定通过
    passClickSure() {
      this.$axios
        .post(this.$store.state.baseUrl + "/auditWithdrawal?java", {
          id: this.recordId,
          flag: 1,
        })
        .then((res) => {
          console.log("审核通过");
          console.log(res);
          this.dialogWithdrawalPassVisible = false;
          this.$message.success({
            message: "审核结果提交成功",
            showClose: true,
            duration: 10000,
          });
          this.getunAuditWithdrawalList();
        })
        .catch((err) => {
          console.log(err);
          this.dialogWithdrawalPassVisible = false;
          this.$message.error({
            message: "审核结果提交失败",
            showClose: true,
            duration: 2000,
          });
        });
    },
    // 拒绝
    refuseClick(id) {
      this.refuseId = id;
      this.dialogWithdrawalRefuseVisible = true;
    },
    // 确定拒绝
    refuseClickSure() {
      this.$axios
        .post(this.$store.state.baseUrl + "/auditWithdrawal?java", {
          id: this.refuseId,
          flag: 0,
        })
        .then((res) => {
          console.log("审核拒绝");
          console.log(res);
          this.dialogWithdrawalRefuseVisible = false;
          this.$message.success({
            message: "审核结果提交成功",
            showClose: true,
            duration: 2000,
          });
          this.getunAuditWithdrawalList();
        })
        .catch((err) => {
          console.log(err);
          this.dialogWithdrawalRefuseVisible = false;
          this.$message.error({
            message: "审核结果提交失败",
            showClose: true,
            duration: 2000,
          });
        });
    },
    // 分页处理数据
    getList() {
      console.log("分页数据");
      this.total = this.unAuditWithdrawalList.length;
      // es6过滤得到满足搜索条件的展示数据list
      this.list = this.unAuditWithdrawalList.filter(
        (item, index) =>
          index < this.page * this.pageNum &&
          index >= this.pageNum * (this.page - 1)
      );
      console.log(this.list);
    },
    // 分页
    handleCurrentChange(val) {
      console.log(`当前页: ${val}`);
      this.page = val;
      this.getList();
      (function smoothscroll() {
        let currentScroll =
          document.documentElement.scrollTop || document.body.scrollTop;
        if (currentScroll > 0) {
          window.requestAnimationFrame(smoothscroll);
          window.scrollTo(0, currentScroll - currentScroll / 5);
        }
      })();
    },
  },
};
</script>

<style lang="scss" scoped>
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
  .el-button {
    width: 80px;
    height: 36px;
    border-radius: 6px;
    font-size: 13px;
  }
}
</style>
