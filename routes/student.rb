class Gamification < Sinatra::Application

  # Get all students
  #
  # return [Array] student objects
  get '/student' do
    if authorized?
      content_type :json
      @student = Student.all()
      status 200
      return @student.to_json
    else
      status 401
    end
  end

  # Get a student by id
  #
  # param [String] the student id
  #
  # return [Object] student
  get '/student/:id' do
    if authorized?
      content_type :json
      student = Student.find(params[:id])
      status 200
      return student.to_json
    else
      status 401
    end
  end

  # Create a new student
  #
  # return [Object] student
  post '/student' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      student = Student.create()
      status 200
      return  student.to_json
    else
      status 401
    end
  end

  # Update a student by id
  #
  # param [String] the student id
  #
  # body [Object] in JSON. ex: {"facebook_id":"<String>", "expert_level":"<Integer>" }
  #
  # return [Object] student
  put '/student/:id' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      student = Student.find(params[:id])

      if student then
        data = JSON.parse request.body.read

        unless data['facebook_id'].nil?
          student.update_attributes(:facebook_id => data['facebook_id'])
          student.save
        end

        unless data['expert_level'].nil?
          student.update_attributes(:expert_level => data['expert_level'])
          student.save
        end

        status 200
        return  student.to_json
      else
        return {"error" => "Student "+params[:id]+" not found"}.to_json
      end
    else
      status 401
    end
  end


  # Delete a student by id
  #
  # param [String] the student id
  #
  # return [Object] message
  delete '/student/:id' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      student = Student.find(params[:id])

      if student.destroy then
        status 200
        return {"message" => "Student "+params[:id]+" deleted"}.to_json
      else
        status 500
        return {"error" => "Student "+params[:id]+" not deleted"}.to_json
      end
    else
      status 401
      return {"error" => "Not authorised"}.to_json
    end
  end
end
