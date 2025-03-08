const Controller = require('egg').Controller;

class HomeController extends Controller {
  index() {
    const { ctx } = this;
    ctx.body = 'hi, egg';
  }

  async stream() {
    const { ctx } = this;
    
    ctx.logger.info('[SSE] New client connected');

    // 设置状态码和 SSE 相关的响应头
    ctx.status = 200;
    ctx.set({
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': 'http://localhost:3000',
      'Access-Control-Allow-Credentials': 'true',
    });

    // 立即发送一个连接成功的消息
    ctx.response.res.write('event: connected\ndata: {"status":"connected"}\n\n');

    let messageCount = 0;
    
    // 准备分析数据
    const analysisData = [
      {
        section: "数据概览",
        content: "分析用户提供的数据，找出增长明显的区域。数据结构包含多个二级战区，每个战区有YoY（年同比增长率）和WoW（周环比增长率）指标。"
      },
      {
        section: "关键指标说明",
        content: "YoY代表年同比，反映与去年同期相比的增长情况；WoW是周环比，显示与上周相比的增长。重点关注这两个指标中的高增长区域。"
      },
      {
        section: "显著增长区域",
        content: "全国品牌零食零售（YoY 77.9%，WoW 115.14%）表现最为突出，两项指标均呈现高增长。"
      },
      {
        section: "特殊增长区域",
        content: "校园大区WoW高达1415.03%，增长惊人，但需注意基数情况。全国品牌正餐WoW达173.11%，近期增长强劲。"
      },
      {
        section: "长期增长亮点",
        content: "东部大区YoY达147.27%，区域品牌客户部YoY为81.76%，显示出良好的长期增长态势。"
      },
      {
        section: "综合分析",
        content: "需要区分长期和短期增长。部分区域如东部大区虽YoY高但WoW下降，表明长期趋势好但近期有波动。建议重点关注双指标均良好的区域。"
      }
    ];
    
    let currentSectionIndex = 0;
    let currentWordIndex = 0;
    let currentWords = [];
    let currentSection = '';
    
    // 创建一个定时器，每次发送一个词
    const interval = setInterval(() => {
      try {
        if (currentSectionIndex >= analysisData.length) {
          // 发送完成事件
          ctx.response.res.write('event: complete\ndata: {"status":"analysis_complete","totalSections":' + analysisData.length + '}\n\n');
          clearInterval(interval);
          return;
        }

        if (!ctx.response.res.writable) {
          clearInterval(interval);
          return;
        }

        // 如果当前section的词已经发送完毕，切换到下一个section
        if (currentWordIndex === 0 || currentWords.length === 0) {
          const data = analysisData[currentSectionIndex];
          currentSection = data.section;
          // 将内容分割成词语（按照标点符号和空格分割）
          currentWords = data.content.match(/[a-zA-Z0-9]+|[\u4e00-\u9fa5]|[.,，。；：%（）\(\)]/g) || [];
        }

        if (currentWordIndex >= currentWords.length) {
          currentSectionIndex++;
          currentWordIndex = 0;
          messageCount++;
          return;
        }

        // 每次发送3个字
        const wordsToSend = [];
        for (let i = 0; i < 3 && currentWordIndex + i < currentWords.length; i++) {
          wordsToSend.push(currentWords[currentWordIndex + i]);
        }
        
        // 添加进度信息
        const progressData = {
          section: currentSection,
          words: wordsToSend,
          progress: {
            currentSection: currentSectionIndex + 1,
            totalSections: analysisData.length,
            currentWord: currentWordIndex + wordsToSend.length,
            totalWords: currentWords.length
          }
        };
        
        ctx.response.res.write(`data: ${JSON.stringify(progressData)}\n\n`);
        
        currentWordIndex += wordsToSend.length;
        messageCount++;
        
        // 每发送一组词记录日志
        if (currentWordIndex % 10 === 0) { // 每10个词记录一次日志，避免日志过多
          ctx.logger.info(`[SSE] Sent words in section ${currentSection}: ${currentWordIndex}/${currentWords.length}`);
        }
      } catch (err) {
        ctx.logger.error('[SSE] Error sending message:', err);
        clearInterval(interval);
      }
    }, 200);  // 每200毫秒发送一个词

    // 当连接关闭时清除定时器
    ctx.response.res.on('close', () => {
      clearInterval(interval);
      ctx.logger.info(`[SSE] Client disconnected after receiving ${messageCount} messages`);
    });

    // 保持连接打开
    await new Promise(resolve => ctx.response.res.on('close', resolve));
  }

  async httpStream() {
    const { ctx } = this;
    
    ctx.logger.info('[HTTP Stream] New client connected');

    // 设置响应头
    ctx.status = 200;
    ctx.set({
      'Content-Type': 'application/json; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': 'http://localhost:3000',
      'Access-Control-Allow-Credentials': 'true',
    });

    // 准备分析数据
    const analysisData = [
      {
        section: "数据概览",
        content: "分析用户提供的数据，找出增长明显的区域。数据结构包含多个二级战区，每个战区有YoY（年同比增长率）和WoW（周环比增长率）指标。"
      },
      {
        section: "关键指标说明",
        content: "YoY代表年同比，反映与去年同期相比的增长情况；WoW是周环比，显示与上周相比的增长。重点关注这两个指标中的高增长区域。"
      },
      {
        section: "显著增长区域",
        content: "全国品牌零食零售（YoY 77.9%，WoW 115.14%）表现最为突出，两项指标均呈现高增长。"
      },
      {
        section: "特殊增长区域",
        content: "校园大区WoW高达1415.03%，增长惊人，但需注意基数情况。全国品牌正餐WoW达173.11%，近期增长强劲。"
      },
      {
        section: "长期增长亮点",
        content: "东部大区YoY达147.27%，区域品牌客户部YoY为81.76%，显示出良好的长期增长态势。"
      },
      {
        section: "综合分析",
        content: "需要区分长期和短期增长。部分区域如东部大区虽YoY高但WoW下降，表明长期趋势好但近期有波动。建议重点关注双指标均良好的区域。"
      }
    ];

    let currentSectionIndex = 0;
    let currentWordIndex = 0;
    let currentWords = [];
    let currentSection = '';
    let messageCount = 0;

    // 创建一个定时器，每次发送一个词
    const interval = setInterval(() => {
      try {
        if (currentSectionIndex >= analysisData.length) {
          // 发送完成消息
          ctx.response.res.write(JSON.stringify({
            status: 'complete',
            totalSections: analysisData.length
          }) + '\n');
          clearInterval(interval);
          return;
        }

        if (!ctx.response.res.writable) {
          clearInterval(interval);
          return;
        }

        // 如果当前section的词已经发送完毕，切换到下一个section
        if (currentWordIndex === 0 || currentWords.length === 0) {
          const data = analysisData[currentSectionIndex];
          currentSection = data.section;
          currentWords = data.content.match(/[a-zA-Z0-9]+|[\u4e00-\u9fa5]|[.,，。；：%（）\(\)]/g) || [];
        }

        if (currentWordIndex >= currentWords.length) {
          currentSectionIndex++;
          currentWordIndex = 0;
          messageCount++;
          return;
        }

        // 每次发送3个字
        const wordsToSend = [];
        for (let i = 0; i < 3 && currentWordIndex + i < currentWords.length; i++) {
          wordsToSend.push(currentWords[currentWordIndex + i]);
        }

        // 构造进度数据
        const progressData = {
          section: currentSection,
          words: wordsToSend,
          progress: {
            currentSection: currentSectionIndex + 1,
            totalSections: analysisData.length,
            currentWord: currentWordIndex + wordsToSend.length,
            totalWords: currentWords.length
          }
        };

        // 发送JSON数据，每条数据后面加换行符
        ctx.response.res.write(JSON.stringify(progressData) + '\n');

        currentWordIndex += wordsToSend.length;
        messageCount++;

        // 每发送一组词记录日志
        if (currentWordIndex % 10 === 0) {
          ctx.logger.info(`[HTTP Stream] Sent words in section ${currentSection}: ${currentWordIndex}/${currentWords.length}`);
        }
      } catch (err) {
        ctx.logger.error('[HTTP Stream] Error sending message:', err);
        clearInterval(interval);
      }
    }, 200);  // 每200毫秒发送一个词

    // 当连接关闭时清除定时器
    ctx.response.res.on('close', () => {
      clearInterval(interval);
      ctx.logger.info(`[HTTP Stream] Client disconnected after receiving ${messageCount} messages`);
    });

    // 保持连接打开
    await new Promise(resolve => ctx.response.res.on('close', resolve));
  }
}

module.exports = HomeController; 