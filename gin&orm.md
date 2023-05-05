[视频](https://www.bilibili.com/video/BV1VV4y1E7Ks/?spm_id_from=333.999.0.0&vd_source=61797847132694249b7545b50b02c981)
[原文](https://juejin.cn/post/7192053234620432441#heading-3)
[Koa2文档](https://koa.bootcss.com/#introduction)

```
package main

import (
	"encoding/json"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/thinkerou/favicon"
)

// 中间件（拦截器），功能：预处理，登录授权、验证、分页、耗时统计...
// func myHandler() gin.HandlerFunc {
// 	return func(ctx *gin.Context) {
// 		// 通过自定义中间件，设置的值，在后续处理只要调用了这个中间件的都可以拿到这里的参数
// 		ctx.Set("usersesion", "userid-1")
// 		ctx.Next()  // 放行
// 		ctx.Abort() // 阻止
// 	}
// }

func main() {
	// 创建一个服务
	ginServer := gin.Default()
	ginServer.Use(favicon.New("./Arctime.ico")) // 这里如果添加了东西然后再运行没有变化，请重启浏览器，浏览器有缓存

	// 加载静态页面
	ginServer.LoadHTMLGlob("templates/*") // 一种是全局加载，一种是加载指定的文件

	// 加载资源文件
	ginServer.Static("/static", "./static")

	// 相应一个页面给前端

	ginServer.GET("/index", func(ctx *gin.Context) {
		ctx.HTML(http.StatusOK, "index.html", gin.H{
			"msg": "This data is come from Go background.",
		})
	})

	// 能加载静态页面也可以加载测试文件

	// 获取请求中的参数

	// 传统方式：usl?userid=xxx&username=conqueror712
	// Rustful方式：/user/info/1/conqueror712

	// 下面是传统方式的例子
	ginServer.GET("/user/info", func(context *gin.Context) { // 这个格式是固定的
		userid := context.Query("userid")
		username := context.Query("username")
		// 拿到之后返回给前端
		context.JSON(http.StatusOK, gin.H{
			"userid":   userid,
			"username": username,
		})
	})
	// 此时执行代码之后，在浏览器中可以输入http://localhost:8081/user/info?userid=111&username=666
	// 就可以看到返回了JSON格式的数据

	// 下面是Rustful方式的例子
	ginServer.GET("/user/info/:userid/:username", func(context *gin.Context) {
		userid := context.Param("userid")
		username := context.Param("username")
		// 还是一样，返回给前端
		context.JSON(http.StatusOK, gin.H{
			"userid":   userid,
			"username": username,
		})
	})
	// 指定代码后，只需要在浏览器中http://localhost:8081/user/info/111/555
	// 就可以看到返回了JSON数据了，非常方便简洁

	// 序列化
	// 前端给后端传递JSON
	ginServer.POST("/json", func(ctx *gin.Context) {
		// request.body
		data, _ := ctx.GetRawData()
		var m map[string]interface{} // Go语言中object一般用空接口来表示，可以接收anything
		// 顺带一提，1.18以上，interface可以直接改成any
		_ = json.Unmarshal(data, &m)
		ctx.JSON(http.StatusOK, m)
	})
	// 用apipost或者postman写一段json传到localhost:8081/json里就可以了
	/*
		json示例：
		{
			"name": "Conqueror712",
			"age": 666,
			"address": "Mars"
		}
	*/
	// 看到后端的实时响应里面接收到数据就可以了

	// 处理表单请求 这些都是支持函数式编程，Go语言特性，可以把函数作为参数传进来
	ginServer.POST("/user/add", func(ctx *gin.Context) {
		username := ctx.PostForm("username")
		password := ctx.PostForm("password")
		ctx.JSON(http.StatusOK, gin.H{
			"msg":      "ok",
			"username": username,
			"password": password,
		})
	})

	// 路由
	ginServer.GET("/test", func(ctx *gin.Context) {
		// 重定向 -> 301
		ctx.Redirect(301, "https://conqueror712.gitee.io/conqueror712.gitee.io/")
	})
	// http://localhost:8081/test

	// 404
	ginServer.NoRoute(func(ctx *gin.Context) {
		ctx.HTML(404, "404.html", nil)
	})

	// 路由组暂略

	// 服务器端口，用服务器端口来访问地址
	ginServer.Run(":8081") // 不写的话默认是8080，也可以更改
}

```

#### GORM特性


#### 完整代码

```
package main

import (
	"fmt"
	"strconv"
	"time"

	// "gorm.io/driver/sqlite"
	"github.com/gin-gonic/gin"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/schema"
)

func main() {
	// 如何连接数据库 ? MySQL + Navicat
	// 需要更改的内容：用户名，密码，数据库名称
	dsn := "root:password@tcp(127.0.0.1:3306)/database?charset=utf8mb4&parseTime=True&loc=Local"
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{
		NamingStrategy: schema.NamingStrategy{
			SingularTable: true,
		},
	})

	fmt.Println("db = ", db)
	fmt.Println("err = ", err)

	// 连接池
	sqlDB, err := db.DB()
	// SetMaxIdleConns 设置空闲连接池中连接的最大数量
	sqlDB.SetMaxIdleConns(10)
	// SetMaxOpenConns 设置打开数据库连接的最大数量。
	sqlDB.SetMaxOpenConns(100)
	// SetConnMaxLifetime 设置了连接可复用的最大时间。
	sqlDB.SetConnMaxLifetime(10 * time.Second) // 10秒钟

	// 结构体
	type List struct {
		gorm.Model        // 主键
		Name       string `gorm:"type:varchar(20); not null" json:"name" binding:"required"`
		State      string `gorm:"type:varchar(20); not null" json:"state" binding:"required"`
		Phone      string `gorm:"type:varchar(20); not null" json:"phone" binding:"required"`
		Email      string `gorm:"type:varchar(40); not null" json:"email" binding:"required"`
		Address    string `gorm:"type:varchar(200); not null" json:"address" binding:"required"`
	}

	// 迁移
	db.AutoMigrate(&List{})

	// 接口
	r := gin.Default()

	// 测试
	// r.GET("/", func(c *gin.Context) {
	// 	c.JSON(200, gin.H{
	// 		"message": "请求成功",
	// 	})
	// })

	// 业务码约定：正确200，错误400

	// 增
	r.POST("/user/add", func(ctx *gin.Context) {
		// 定义一个变量指向结构体
		var data List
		// 绑定方法
		err := ctx.ShouldBindJSON(&data)
		// 判断绑定是否有错误
		if err != nil {
			ctx.JSON(200, gin.H{
				"msg":  "添加失败",
				"data": gin.H{},
				"code": "400",
			})
		} else {
			// 数据库的操作
			db.Create(&data) // 创建一条数据
			ctx.JSON(200, gin.H{
				"msg":  "添加成功",
				"data": data,
				"code": "200",
			})
		}
	})

	// 删
	// 1. 找到对应的id对应的条目
	// 2. 判断id是否存在
	// 3. 从数据库中删除 or 返回id没有找到

	// Restful编码规范
	r.DELETE("/user/delete/:id", func(ctx *gin.Context) {
		var data []List
		// 接收id
		id := ctx.Param("id") // 如果有键值对形式的话用Query()
		// 判断id是否存在
		db.Where("id = ? ", id).Find(&data)
		if len(data) == 0 {
			ctx.JSON(200, gin.H{
				"msg":  "id没有找到，删除失败",
				"code": 400,
			})
		} else {
			// 操作数据库删除（删除id所对应的那一条）
			// db.Where("id = ? ", id).Delete(&data) <- 其实不需要这样写，因为查到的data里面就是要删除的数据
			db.Delete(&data)

			ctx.JSON(200, gin.H{
				"msg":  "删除成功",
				"code": 200,
			})
		}

	})

	// 改
	r.PUT("/user/update/:id", func(ctx *gin.Context) {
		// 1. 找到对应的id所对应的条目
		// 2. 判断id是否存在
		// 3. 修改对应条目 or 返回id没有找到
		var data List
		id := ctx.Param("id")
		// db.Where("id = ?", id).Find(&data) 可以这样写，也可以写成下面那样
		// 还可以再Where后面加上Count函数，可以查出来这个条件对应的条数
		db.Select("id").Where("id = ? ", id).Find(&data)
		if data.ID == 0 {
			ctx.JSON(200, gin.H{
				"msg":  "用户id没有找到",
				"code": 400,
			})
		} else {
			// 绑定一下
			err := ctx.ShouldBindJSON(&data)
			if err != nil {
				ctx.JSON(200, gin.H{
					"msg":  "修改失败",
					"code": 400,
				})
			} else {
				// db修改数据库内容
				db.Where("id = ?", id).Updates(&data)
				ctx.JSON(200, gin.H{
					"msg":  "修改成功",
					"code": 200,
				})
			}
		}
	})

	// 查
	// 第一种：条件查询，
	r.GET("/user/list/:name", func(ctx *gin.Context) {
		// 获取路径参数
		name := ctx.Param("name")
		var dataList []List
		// 查询数据库
		db.Where("name = ? ", name).Find(&dataList)
		// 判断是否查询到数据
		if len(dataList) == 0 {
			ctx.JSON(200, gin.H{
				"msg":  "没有查询到数据",
				"code": "400",
				"data": gin.H{},
			})
		} else {
			ctx.JSON(200, gin.H{
				"msg":  "查询成功",
				"code": "200",
				"data": dataList,
			})
		}
	})

	// 第二种：全部查询 / 分页查询
	r.GET("/user/list", func(ctx *gin.Context) {
		var dataList []List
		// 查询全部数据 or 查询分页数据
		pageSize, _ := strconv.Atoi(ctx.Query("pageSize"))
		pageNum, _ := strconv.Atoi(ctx.Query("pageNum"))

		// 判断是否需要分页
		if pageSize == 0 {
			pageSize = -1
		}
		if pageNum == 0 {
			pageNum = -1
		}

		offsetVal := (pageNum - 1) * pageSize // 固定写法 记住就行
		if pageNum == -1 && pageSize == -1 {
			offsetVal = -1
		}

		// 返回一个总数
		var total int64

		// 查询数据库
		db.Model(dataList).Count(&total).Limit(pageSize).Offset(offsetVal).Find(&dataList)

		if len(dataList) == 0 {
			ctx.JSON(200, gin.H{
				"msg":  "没有查询到数据",
				"code": 400,
				"data": gin.H{},
			})
		} else {
			ctx.JSON(200, gin.H{
				"msg":  "查询成功",
				"code": 200,
				"data": gin.H{
					"list":     dataList,
					"total":    total,
					"pageNum":  pageNum,
					"pageSize": pageSize,
				},
			})
		}

	})

	// 端口号
	PORT := "3001"
	r.Run(":" + PORT)
}

```
