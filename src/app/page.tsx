"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

const Home = () => {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md space-y-6"
      >
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">
            ドラフト会議
          </h1>
          <p className="text-muted-foreground">
            チームメンバーをドラフトで編成しよう
          </p>
        </div>

        <div className="space-y-4">
          <Card
            className="cursor-pointer transition-shadow hover:shadow-lg"
            onClick={() => router.push("/setup")}
          >
            <CardHeader>
              <CardTitle className="text-lg">シンプルUI</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                シンプルな画面でドラフトを進行します
              </p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer transition-shadow hover:shadow-lg"
            onClick={() => router.push("/setup?mode=performance")}
          >
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                演出あり
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-normal">
                  NEW
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                ドラフト会議風の演出付きモード
              </p>
            </CardContent>
          </Card>
        </div>

        <Button
          className="w-full"
          size="lg"
          onClick={() => router.push("/setup")}
        >
          ドラフトを始める
        </Button>
      </motion.div>
    </div>
  );
};

export default Home;
