const { v4: uuidv4, validate: uuidValidate } = require('uuid')
const projectService = require('../services/projectService')
const userService = require('../services/userService')
const { response } = require('../utils/middleware')

const getProjects = async (req, res, next) => {
  try {
    // Mengambil parameter startDate dan endDate dari query string
    const { startDate, endDate } = req.query;
    
    let projects;
    
    if (startDate && endDate) {
      // Jika parameter startDate dan endDate ada, filter proyek berdasarkan tanggal
      projects = await projectService.findProjectsByDateRange(startDate, endDate);
      response(res, 200, 'projects filter retrieved successfully', { projects });
    } else {
      // Jika tidak ada parameter, ambil semua proyek
      projects = await projectService.findAllProjects();
      response(res, 200, 'All projects retrieved successfully', { projects });
    }
    
    if (projects.length === 0) {
      return response(res, 404, 'No Project found');
    }
    
    
  } catch (error) {
    response(res, 500, 'Internal Server Error', { error: error.message });
    console.log(error);
    next(error);
  }
};



const getProjectById = async (req, res, next) => {
  try {
    if (!uuidValidate(req.params.id)) {
      return response(res, 404, `Project with ID: ${req.params.id} not found`)
    }
    const project = await projectService.findProjectById(req.params.id)
    if (!project) {
      return response(res, 404, `Project with ID: ${req.params.id} not found`)
    }
    response(res, 200, `${project.name} retrieved successfully`, { project })
  } catch (error) {
    response(res, 500, 'Internal Server Error', { error: error.message })
    console.log(error)
    next(error)
  }
}

const createProject = async (req, res, next) => {
  try {
    const projectData = { ...req.body, id: uuidv4() }
    const project = await projectService.createProject(projectData)
    response(res, 201, `${project.name} created successfully`, { project })
  } catch (error) {
    response(res, 500, 'Internal Server Error', { error: error.message })
    console.log(error)
    next(error)
  }
}

const updateProject = async (req, res, next) => {
  try {
    if (!uuidValidate(req.params.id)) {
      return response(res, 404, `Project with ID: ${req.params.id} not found`)
    }
    const [updated] = await projectService.updateProject(req.params.id, req.body)
    if (!updated) {
      return response(res, 404, `Projects with ID: ${req.params.id} not found`)
    }
    const updatedProject = await projectService.findProjectById(req.params.id)
    response(res, 200, `${updatedProject.name} updated successfully`, { updatedProject })
  } catch (error) {
    response(res, 500, 'Internal Server Error', { error: error.message })
    console.log(error)
    next(error)
  }
}

const deleteProject = async (req, res, next) => {
  try {
    if (!uuidValidate(req.params.id)) {
      return response(res, 404, `Project with ID: ${req.params.id} not found`)
    }
    const project = await projectService.findProjectById(req.params.id)
    const deleted = await projectService.deleteProject(req.params.id)
    if (!deleted) {
      return response(res, 404, `Project with ID: ${req.params.id} not found`)
    }
    response(res, 200, `${project.name} deleted successfully`)
  } catch (error) {
    response(res, 500, 'Internal Server Error', { error: error.message })
    console.log(error)
    next(error)
  }
}

const getProjectUsers = async (req, res, next) => {
  try {
    if (!uuidValidate(req.params.id)) {
      return response(res, 404, `Project with ID: ${req.params.id} not found`)
    }
    const project = await projectService.findProjectUsers(req.params.id)
    if (!project) {
      return response(res, 404, `Project with ID: ${req.params.id} was not found`)
    }
    if (!project.Users || project.Users.length === 0) {
      return response(res, 404, `No users found for ${project.name}`)
    }
    response(res, 200, 'Project retrieved successfully', { project })
  } catch (error) {
    response(res, 500, 'Internal Server Error', { error: error.message })
    console.log(error)
    next(error)
  }
}

const addUserToProject = async (req, res, next) => {
  try {
    const { projectId, userId } = req.params
    if (!uuidValidate(projectId)) {
      return response(res, 404, `Project with ID: ${projectId} not found`)
    }
    if (!uuidValidate(userId)) {
      return response(res, 404, `User with ID: ${userId} not found`)
    }
    const project = await projectService.findProjectById(projectId)
    const user = await userService.findUserById(userId)
    if (!project) {
      return response(res, 404, `Project with ID: ${projectId} not found or not created`)
    }
    if (!user) {
      return response(res, 404, `User with ID: ${userId} not found or not registered`)
    }
    const isUserAdded = await projectService.isUserInProject(projectId, userId)
    if (isUserAdded) {
      return response(res, 400, `${user.fullName} is already added to the project`)
    }
    const ProjectUserData = { projectId, userId, id: uuidv4() }
    const addProjectUser = await projectService.addUserToProject(ProjectUserData)
    response(res, 200, 'User added to project successfully', { addProjectUser })
  } catch (error) {
    response(res, 500, 'Internal Server Error', { error: error.message })
    console.log(error)
    next(error)
  }
}

const removeUserFromProject = async (req, res, next) => {
  try {
    const { projectId, userId } = req.params
    if (!uuidValidate(projectId)) {
      return response(res, 404, `Project with ID: ${projectId} not found`)
    }
    if (!uuidValidate(userId)) {
      return response(res, 404, `User with ID: ${userId} not found`)
    }
    const user = await userService.findUserById(userId)
    const isUserAdded = await projectService.isUserInProject(projectId, userId)
    if (!isUserAdded) {
      return response(res, 404, `${user.fullName} not in this project`)
    }
    const project = await projectService.removeUserFromProject(projectId, userId)
    response(res, 200, 'User removed from project successfully', { project })
  } catch (error) {
    response(res, 500, 'Internal Server Error', { error: error.message })
    console.log(error)
    next(error)
  }
}

module.exports = { getProjects, getProjectById, createProject, updateProject, deleteProject, getProjectUsers, addUserToProject, removeUserFromProject }
