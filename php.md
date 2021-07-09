```
    public function aaaa(Request  $request)
    {
        /**
         * 生成不重复的随机数字(不能超过10位数，否则while循环陷入死循环)
         * @param  int $start 需要生成的数字开始范围
         * @param  int $end 结束范围
         * @param  int $length 需要生成的随机数个数
         * @return number      生成的随机数
         */
        function getRandNumber($start = 0, $end = 9, $length = 8)
        {
            //初始化变量为0
            $count = 0;
            //建一个新数组
            $temp = array();
            while ($count < $length) {
                //在一定范围内随机生成一个数放入数组中
                $temp[] = mt_rand($start, $end);
                //$data = array_unique($temp);
                //去除数组中的重复值用了“翻翻法”，就是用array_flip()把数组的key和value交换两次。这种做法比用 array_unique() 快得多。
                $data = array_flip(array_flip($temp));
                //将数组的数量存入变量count中
                $count = count($data);
            }
            //为数组赋予新的键名
            shuffle($data);
            //数组转字符串
            $str = implode(",", $data);
            //替换掉逗号
            $number = str_replace(',', '', $str);
            return $number;
        }

        for($i=1;$i<=100000;$i++){
            try {
                $id =  getRandNumber(0, 9, 8);
                $exists = \Illuminate\Support\Facades\DB::table("cm_nick_user_ids")->where("name","")->exists();
                if(!$exists){
                    \Illuminate\Support\Facades\DB::table("cm_nick_user_ids")->insert(['name'=>$id]);
                }
                echo $id."<br/>";
            }catch (\Exception $e){
                var_dump($e->getMessage());
            }
        }
        return 'ok';
    }
```
