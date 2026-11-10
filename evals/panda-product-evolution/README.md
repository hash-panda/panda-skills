# panda-product-evolution 评估

评估产物独立于可安装 Skill，避免把答案或评分规则加载成技能知识。
所有产品材料和队列代码都是合成夹具，不是任何真实项目的运行数据。

## 文件

- `inputs/`：A–D 四个独立决策任务，以及上轮实验记录。
- `rubric.md`：在行为运行前固定的标准和结论边界。
- `fixtures/queue/`：E 场景的原始缺陷代码与公开行为要求。
- `checks/queue-contract.test.mjs`：由评估者保留、实现者未读取的六项行为契约测试；发布后该集合不再算隐藏集。
- `runs/2026-11-10/`：原始回答、实际执行产物、测试输出和 Skill 内容摘要校验值。
- `report-2026-11-10.md`：本次结果、发现与限制。

## 决策行为复查

1. 开启两份全新上下文，保持模型设置、输入和工具范围一致。
2. 一份只提供 `inputs/cases.md` 与它引用的历史；另一份额外明确加载本 Skill。
3. 不提供 `rubric.md`、既有答案或预期结论；禁止读取另一份输出。
4. 保存实际输出，再按预先固定的规则逐项判断，保留不同判断和关键失败。
5. 需要测试新版本的泛化时另建未用于修改 Skill 的任务；重复旧题只能算回归检查。

本次每种条件只运行一份包含四题的任务，不能估计稳定的平均增益或显著性。对照的价值是找具体缺陷；基线同样表现良好时如实记录。

## 重现本地执行检查

在仓库根目录运行，需要 Node.js 24。无需 npm 安装依赖。

```bash
# 原始夹具：重现重复事件缺陷，预期返回非零退出码
EVOLUTION_QUEUE_MODULE=evals/panda-product-evolution/fixtures/queue/queue.ts \
  node --test evals/panda-product-evolution/checks/queue-contract.test.mjs

# Skill 执行后产物：检查行为契约
EVOLUTION_QUEUE_MODULE=evals/panda-product-evolution/runs/2026-11-10/execution/queue.ts \
  node --test evals/panda-product-evolution/checks/queue-contract.test.mjs

# 实现者添加的开发测试
node --test evals/panda-product-evolution/runs/2026-11-10/execution/queue.test.ts

# 第二轮：保留跨进程重启的新需求反例，预期 1 通过、1 失败
node --test evals/panda-product-evolution/runs/2026-11-10/continuation/restart-repro.test.ts
```

原始夹具故意保留缺陷。不要把其失败当作当前 Skill 或仓库新增缺陷，也不要改掉原始夹具来让对照结果变绿。

## 能验证与不能验证的事项

显式加载后的回答可验证指定任务中的决策行为；工具执行和独立测试可验证给定代码的行为；新上下文读取记录可检查接续机制。
这些都不能单独证明平台会自动触发技能、跨模型效果稳定、线上 ROI 增加，或系统具备无限递归自我改进能力。
