import News from "../models/News.js";

export const listNews = async (req, res) => {
  try {
    const newsItems = await News.findAll({
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json(newsItems);
  } catch (error) {
    console.error("Failed to fetch news:", error);
    res.status(500).json({ message: "Failed to fetch news", error: error.message });
  }
};

export const createNews = async (req, res) => {
  try {
    const news = await News.create(req.body);
    res.status(201).json(news);
  } catch (error) {
    console.error("Failed to create news:", error);
    res.status(400).json({ message: "Failed to create news", error: error.message });
  }
};



