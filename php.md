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

```
php单例模式 数据库操作类和网络请求类都很喜欢用单例模式，那么我们就来实现一个Http请求类的单例模式的开发。
<?php 

class HttpService{
    private static $instance;

    public function GetInstance(){
        if(self::$instance == NULL){
            self::$instance = new HttpService();
        }
        return self::$instance;
    }

    public function Post(){
        echo '发送Post请求', PHP_EOL;
    }

    public function Get(){
        echo '发送Get请求', PHP_EOL;
    }
}

$httpA = new HttpService();
$httpA->Post();
$httpA->Get();

$httpB = new HttpService();
$httpB->Post();
$httpB->Get();

var_dump($httpA == $httpB);
```

```
// 读取json文件
$json = file_get_contents('manifest.json');
//
// // 转换成关联数组
$array = json_decode($json, true);
//
// // 打印数组
print_r($array['id']);
$array['id']='ceshi';
file_put_contents('manifest.json',json_encode($array));

```

```
    public function csvToPng($csvFile)
    {
        $data = array(); // 存储CSV数据的数组

        // 打开CSV文件
        if ($handle = fopen($csvFile, 'r')) {
            // 逐行读取CSV文件
            while (($row = fgetcsv($handle)) !== false) {
                // 将每行数据存储到数组中
                $data[] = $row;
            }
            // 关闭CSV文件
            fclose($handle);
        } else {
            echo "无法打开CSV文件：$csvFile";
        }

        $image_file = '/tmp/image.png';
//        $fontFile = '/usr/share/fonts/wqy-microhei/wqy-microhei.ttc';
        $fontFile = __DIR__ . '/../tools/SourceHanSerifCN-ExtraLight-3.otf';

        // Create a blank image
        $image = imagecreatetruecolor(800, count($data)*15);

        // Set the background color
        $bg_color = imagecolorallocate($image, 255, 255, 255);
        imagefill($image, 0, 0, $bg_color);

        // 设置文本颜色为黑色
        $textColor = imagecolorallocate($image, 0, 0, 0);
        // Load the font file
//        $font = imageloadfont($font_file);

//        $text = '你好，世界！';
//        imagettftext($image, 14, 0, 10, 50, $textColor, $fontFile, $text);

        foreach ($data as $index => $datum){
            foreach ($datum as &$value){
                str_replace('\n', "", $value);
            }
            $value = join(" ", $datum);
            imagettftext($image, 10, 0, 10, 15+($index* 15), $textColor, $fontFile, $value);
//            imagettftext($image, 13, 0, 10, 10*($index+1), $text_color, $font, $value);
        }

        // Save the image to a file
        imagepng($image, $image_file);

        // Free up memory
        imagedestroy($image);
    }
```
