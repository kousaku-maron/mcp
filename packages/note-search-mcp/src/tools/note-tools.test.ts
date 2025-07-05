import { describe, it, expect } from "vitest";
import { fetchNoteArticle } from "./note-tools";

describe("fetchNoteArticle", () => {
  it("should fetch and convert a note article successfully", async () => {
    // URL: https://note.com/gorori1994/n/nb7564bc837cc
    const result = await fetchNoteArticle("nb7564bc837cc");

    // For debugging purposes
    // console.log(result);

    // h1
    const h1 =
      "# なぜ今、「AIエージェント」が急増しているのか？これからの仕事は「AIが運転席」かも";
    expect(result).toContain(h1);

    // h2
    const h2 = [
      "## LLMモデルが「質的転換点」を迎えた",
      "## プロダクトの戦場が変わり始めた",
      "## AIエージェントが直面する「言語化の壁」",
      "## まとめ",
    ];
    h2.forEach((text) => {
      expect(result).toContain(text);
    });

    // link
    const link = [
      "[**Manus** _Manus is a general AI agent that turns your thoughts into act_ _manus.im_](https://manus.im/)",
      "[**Devin** _Devin is a collaborative AI teammate built to help ambitious_ _devin.ai_](https://devin.ai/)",
      "[**ChatGPT - PdMの役割整理** _Shared via ChatGPT_ _chatgpt.com_](https://chatgpt.com/share/67e2d4bc-789c-8002-930b-02e912127de7)",
    ];
    link.forEach((text) => {
      expect(result).toContain(text);
    });

    // paragraph
    const paragraph = [
      "AIエージェントサービスが急増している最大の理由は、LLMの能力が「質的転換点」を迎えたことにあると考えています。",
      "これは私なりの解釈なのですが、**GPT-4oやClaude 3.5 Sonnet以降のモデルが精度と汎用性で「ビジネスで本格的に使えるレベル」に達した**と感じています。",
      "GPT-3.5時代には、どれだけプロンプトを工夫しても、ハルシネーション（事実と異なる情報の生成）や指示の無視、内容の薄いアウトプットとなってしまうといった問題が多かったと思います。",
      "正直なところ、実務で使える場面はかなり限られていたのではないでしょうか。",
      "しかし、GPT-4o以降の状況を見ると、この状況は大きく変わってきたように感じます。プロンプトへの忠実さやアウトプットの内容が、私たちの期待値を超えたと感じています。",
      "**加えて、最近のモデルは複雑な指示やタスクに対する「思考力」や「推論力」も大きく向上しており、これも重要な変化のひとつだと感じています。**",
      "以前であれば段取りや判断を人間が担う必要があったようなケースでも、LLMが自ら適切な手順を組み立て、一定の成果物を出せるようになっています。",
      "**この変化は、私の経験からすると単なる改良の延長線上ではなく、実用レベルへの転換点**が訪れたと感じています。もちろん、まだ完璧ではありませんが、明らかな変化を感じています。",
      `"PdMの役割を構造的に整理してください。"と言ってみると…`,
    ];
    paragraph.forEach((text) => {
      expect(result).toContain(text);
    });
  });
});
