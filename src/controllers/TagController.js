const Project = require("../models/Project");
const Tag = require("../models/Tag");

async function createTag(req, res) {
  const { id } = req.params;
  const { name, description, color } = req.body;

  const project = await Project.findById(id);
  if (!project) {
    return res.status(404).json({
      message: "Project not found",
    });
  }
  const newTag = await Tag.create({
    name,
    description,
    color,
    project: project._id,
  });
  const savedTag = await newTag.save();
  // push the new tag to the project tags array
  await project.tags.push(savedTag);
  await project.save();

  return res.status(200).json({
    message: "Tag successfully created",
  });
}

async function getTags(req, res) {
  const { id } = req.params;
  const tags = await Tag.find({ project: id });
  if (!tags) {
    return res.status(404).json({
      message: "Project not found",
    });
  }
  return res.status(200).json(tags);
}

async function deleteTag(req, res) {
  const { tagId } = req.body;

  const project = await Tag.findByIdAndDelete(tagId);
  if (!project) {
    return res.status(404).json({
      message: "Project not found",
    });
  }

  return res.status(200).json({
    message: "Tag successfully deleted",
  });
}

module.exports = {
  createTag,
  getTags,
  deleteTag,
};
